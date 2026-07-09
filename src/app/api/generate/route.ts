import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// ✅ The actual enforcement — real limits per plan, checked and written
// server-side. Before this, the count only ever lived in localStorage,
// which anyone could clear or bypass entirely by calling this route directly.
const PLAN_LIMITS: Record<string, number> = { free: 3, pro: 100, ultra: Infinity };
const ANON_DAILY_LIMIT = 3; // matches the free tier — the /try trial shouldn't out-give the free plan

// ✅ Premium feature gates — checked server-side BEFORE consuming a
// generation credit, so a blocked request never costs the user anything.
const PREMIUM_TYPES: Record<string, string[]> = {
  review: ['pro', 'ultra'],       // Brutal Reviewer
  expand: ['pro', 'ultra'],       // Content Expansion Engine
  competitor: ['ultra'],          // Competitor Intelligence + Link Cloner
};

// ✅ COST OPTIMIZATION — two levers, both big:
//
// 1. Model routing: titles/hooks/assistant are simple tasks → Flash-Lite
//    (cheapest Gemini model, ~4x higher free-tier daily allowance, faster).
//    Only long-form outputs use Flash. On the free tier this multiplies how
//    many generations per day CRÉO can serve before hitting rate limits.
//
// 2. Thinking disabled (thinkingBudget: 0): Gemini 2.5 Flash "thinks" by
//    default, silently burning 5–10x more output tokens per request on
//    internal reasoning these tasks don't need. Off = cheaper AND faster.
const MODEL_FOR: Record<string, string> = {
  titles: "gemini-2.5-flash-lite",
  hooks: "gemini-2.5-flash-lite",
  assistant: "gemini-2.5-flash-lite",
  script: "gemini-2.5-flash",
  review: "gemini-2.5-flash",
  expand: "gemini-2.5-flash",
  competitor: "gemini-2.5-flash",
};
const MAX_TOKENS_FOR: Record<string, number> = {
  titles: 512,
  hooks: 512,
  assistant: 512,
  script: 4096, // generous cap so long scripts never truncate, but a runaway response can't blow the token budget
  review: 4096,
  expand: 6144, // a full multi-platform content pack is long by design
  competitor: 4096,
};

// Filler words/phrases that scream "AI-generated" — banned in every prompt.
const BANNED_PHRASES =
  '"delve", "unleash", "game-changer", "dive in", "in today\'s video", "welcome back to my channel", "buckle up", "look no further", "revolutionize", "elevate", "unlock the secrets"';

function todayDate(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

async function callGemini(prompt: string, forceType: string, retries = 3): Promise<{ ok: true; text: string } | { ok: false; rateLimited: boolean }> {
  const model = MODEL_FOR[forceType] || MODEL_FOR.script;
  for (let i = 0; i < retries; i++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: MAX_TOKENS_FOR[forceType] || 4096,
            temperature: 0.9,
            // ✅ No hidden "thinking" tokens — the single biggest per-request saving.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );
    if (response.status === 503) {
      // Model overloaded — brief pause, then retry.
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    if (response.status === 429) {
      // ✅ Free-tier rate limit hit — don't burn retries (per-minute windows
      // don't clear in 1s); tell the client honestly so it can say "try again
      // in a moment" instead of showing broken output.
      return { ok: false, rateLimited: true };
    }
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text === "string" && text.trim().length > 0) return { ok: true, text };
    throw new Error("Empty Gemini response");
  }
  return { ok: false, rateLimited: false };
}

interface AuthedProfile {
  userId: string;
  plan: string;
  limit: number;
  currentCount: number;
  memory: Record<string, string> | null;
  streak: number;
  lastGenDate: string | null;
}

// ✅ Verified via the caller's real Supabase session token — never trusts a
// client-supplied user ID. Returns null for invalid/expired tokens so the
// caller can fall through to anonymous handling.
async function getAuthedProfile(token: string): Promise<AuthedProfile | null> {
  const admin = getSupabaseAdmin();
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return null;

  const userId = userData.user.id;
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, daily_gen_count, daily_gen_reset_date, creator_memory, streak_count, last_gen_date, referral_bonus')
    .eq('user_id', userId)
    .single();

  const plan = profile?.plan || 'free';
  // ✅ Referral reward: each successful referral permanently adds +1 to the
  // FREE daily limit (capped at +10 in the referral API). Paid plans keep
  // their own limits.
  const referralBonus = Math.min(profile?.referral_bonus || 0, 10);
  const baseLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const limit = plan === 'free' ? baseLimit + referralBonus : baseLimit;
  const today = todayDate();
  const isNewDay = !profile || profile.daily_gen_reset_date !== today;
  const currentCount = isNewDay ? 0 : (profile.daily_gen_count || 0);
  const memory = plan === 'ultra' && profile?.creator_memory && typeof profile.creator_memory === 'object'
    ? profile.creator_memory
    : null;

  return {
    userId, plan, limit, currentCount, memory,
    streak: profile?.streak_count || 0,
    lastGenDate: profile?.last_gen_date || null,
  };
}

// Record the usage + advance the streak. If generation fails after this,
// that's an acceptable trade-off vs. the complexity of a rollback.
// ✅ STREAK SYSTEM: generate on consecutive days → streak grows; miss a day →
// back to 1. Computed server-side so it can't be faked client-side.
function yesterdayDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function recordUsage(profile: AuthedProfile): Promise<number> {
  const admin = getSupabaseAdmin();
  const today = todayDate();
  let newStreak = profile.streak;
  if (profile.lastGenDate === today) {
    newStreak = Math.max(profile.streak, 1); // already counted today
  } else if (profile.lastGenDate === yesterdayDate()) {
    newStreak = profile.streak + 1;
  } else {
    newStreak = 1;
  }
  await admin.from('profiles').update({
    daily_gen_count: profile.currentCount + 1,
    daily_gen_reset_date: today,
    streak_count: newStreak,
    last_gen_date: today,
  }).eq('user_id', profile.userId);
  return newStreak;
}

async function checkAnonymousLimit(ip: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const today = todayDate();
  const { data: existing } = await admin
    .from('anon_generation_log')
    .select('count')
    .eq('ip', ip)
    .eq('log_date', today)
    .single();

  const currentCount = existing?.count || 0;
  if (currentCount >= ANON_DAILY_LIMIT) return false;

  await admin.from('anon_generation_log').upsert({
    ip, log_date: today, count: currentCount + 1,
  }, { onConflict: 'ip,log_date' });

  return true;
}

// ✅ CREATOR MEMORY (Ultra) — the signature feature. When an Ultra user has
// set up their Creator Brain, every generation is personalized to their
// niche, audience, style, and goals. This block is prepended to all prompts.
function memoryBlock(memory: Record<string, string> | null): string {
  if (!memory) return '';
  const fields: Array<[string, string]> = [
    ['Niche', memory.niche],
    ['Audience', memory.audience],
    ['Voice & style', memory.style],
    ['Goals', memory.goals],
  ];
  const lines = fields
    .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
    .map(([k, v]) => `- ${k}: ${v.trim().slice(0, 500)}`);
  if (lines.length === 0) return '';
  return `CREATOR PROFILE — you are writing for this specific creator. Match their world exactly:\n${lines.join('\n')}\n\n`;
}

function buildPrompt(forceType: string, idea: string, memory: Record<string, string> | null): string {
  const mem = memoryBlock(memory);

  if (forceType === "titles") {
    return `${mem}You are a YouTube title strategist who studies what actually gets clicked. Generate exactly 6 viral YouTube titles for this topic: "${idea}".
Rules:
- Each title on a new line
- No numbering, no bullet points, no extra text
- Mix these proven patterns across the 6: curiosity gap, bold specific claim, negative framing ("stop doing X"), number + payoff, personal stakes ("I tried X"), open question
- Under 60 characters each where possible
- Sound like a human creator wrote them. NEVER use: ${BANNED_PHRASES}
- Only output the 6 titles, nothing else`;
  }

  if (forceType === "hooks") {
    return `${mem}You are a YouTube hook writer who studies audience retention. Generate exactly 3 opening hooks for a YouTube video titled: "${idea}".
Rules:
- Each hook on a new line, separated by a blank line
- Each hook is 1-3 sentences max, written to be SPOKEN aloud
- Use one of each: (1) curiosity gap — tease the payoff without revealing it, (2) stakes/negativity — what goes wrong if they skip this, (3) bold claim or open loop backed by a specific detail
- Concrete and specific beats dramatic and vague. NEVER use: ${BANNED_PHRASES}
- No numbering, no bullet points, no labels
- Only output the 3 hooks, nothing else`;
  }

  if (forceType === "assistant") {
    return `${mem}You are Nova, an expert AI content co-writer inside CRÉO, a viral content creation app.
The user is a content creator asking for help with their video content.
Be concise, friendly, and actionable. Max 3-4 sentences per response.
Never use: ${BANNED_PHRASES}.
Help with: improving titles, hooks, scripts, CTAs, tone, structure, or any content request.

User request: "${idea}"`;
  }

  // ✅ BRUTAL REVIEWER (Pro/Ultra) — no-mercy scoring + a fixed version.
  if (forceType === "review") {
    return `${mem}You are CRÉO's Brutal Reviewer — a ruthless retention expert who has watched a million viewers click away. Review the script below with total honesty. No flattery, no hedging. If it's weak, say exactly why.

Output in EXACTLY this format:

SCORES
Hook Strength: X/10
Curiosity: X/10
Emotional Pull: X/10
Retention: X/10
Overall: X/10

THE BRUTAL TRUTH
1. <biggest problem — be specific, quote the weak line>
2. <second problem>
3. <third problem>

THE FIX
<rewrite the weakest sections so they actually hold attention — keep the creator's voice, show only the improved parts with a one-line note on what changed>

Rules: be direct but constructive, never cruel about the person — only the content. NEVER use: ${BANNED_PHRASES}.

SCRIPT TO REVIEW:
"${idea}"`;
  }

  // ✅ CONTENT EXPANSION ENGINE (Pro/Ultra) — one idea → a week of content.
  if (forceType === "expand") {
    return `${mem}You are CRÉO's Content Expansion Engine. Take this ONE idea and turn it into a complete multi-platform content pack: "${idea}"

Output in EXACTLY this structure with these exact headers:

🎣 5 HOOKS
<5 spoken-aloud opening hooks, one per line>

🏷️ 5 TITLES
<5 click-worthy titles, one per line, under 60 characters>

📱 3 SHORTS CONCEPTS
<each: a hook line + 3 quick beats, compact>

🎬 1 REEL SCRIPT (30 SECONDS)
<timestamped 0:00-0:30, written to be spoken>

🧵 1 X/TWITTER THREAD
<5 tweets, numbered, first tweet is the hook>

💼 1 LINKEDIN POST
<a native LinkedIn post with a strong first line — no hashtag spam>

Rules: every piece platform-native, human, specific. NEVER use: ${BANNED_PHRASES}.`;
  }

  // ✅ COMPETITOR INTELLIGENCE + LINK CLONER (Ultra) — paste a competitor's
  // transcript, titles, or hooks; extract their viral framework; generate
  // matched variations for the user's own topic.
  if (forceType === "competitor") {
    return `${mem}You are CRÉO's Competitor Intelligence engine. A creator has pasted material from a competitor's high-performing content (a transcript, titles, hooks, or descriptions), possibly followed by their own topic.

Do TWO jobs, in EXACTLY this structure with these exact headers:

🔬 FRAMEWORK BREAKDOWN
Hook Style: <what technique their openings use — curiosity gap, stakes, bold claim, story cold-open, etc. Quote one example>
Structure: <how their content is built — pacing, sections, payoff placement>
Psychological Triggers: <the specific emotions/drives they exploit — FOMO, status, curiosity, outrage, belonging>
Title Patterns: <the repeatable formulas in their titles, as fill-in-the-blank templates>

🧬 CLONED FOR YOU
3 HOOKS — using their exact framework but for the creator's topic (never copy their words — clone the STRUCTURE, not the content):
<3 hooks>

3 TITLES — using their title patterns for the creator's topic:
<3 titles>

Rules: extract patterns, never plagiarize actual sentences. Concrete beats vague. NEVER use: ${BANNED_PHRASES}.

COMPETITOR MATERIAL + CREATOR'S TOPIC:
"${idea}"`;
  }

  // default: full script
  return `${mem}You are a professional YouTube scriptwriter whose scripts sound like a real person talking, never like AI. Write a full YouTube script for: "${idea}".
Format:
- Use clear section headers like [INTRO - 0:00-0:15]
- Include timestamps
- Write naturally and conversationally — short sentences, contractions, direct address ("you")
- Open with the hook immediately, no channel intro or greeting
- End with ONE specific CTA, not a generic "like and subscribe"
- NEVER use: ${BANNED_PHRASES}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea: string = body.idea || "make a video";
    const forceType: string = body.forceType || "script";

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const profile = token ? await getAuthedProfile(token) : null;

    // ✅ Premium gate FIRST — before any credit is consumed. A Free (or
    // anonymous) user tapping a Pro feature gets a clean upsell, not a
    // wasted generation.
    const requiredPlans = PREMIUM_TYPES[forceType];
    if (requiredPlans && (!profile || !requiredPlans.includes(profile.plan))) {
      return NextResponse.json(
        {
          error: 'upgrade_required',
          upgradeRequired: true,
          feature: forceType,
          message: forceType === 'review'
            ? 'Brutal Reviewer is a Pro feature — upgrade to get your scripts scored and fixed.'
            : 'The Content Expansion Engine is a Pro feature — upgrade to turn one idea into a full content pack.',
        },
        { status: 403 }
      );
    }

    // ✅ Limit check happens before any Gemini call — a blocked request
    // shouldn't cost anything.
    let streak = 0;
    if (profile) {
      if (profile.currentCount >= profile.limit) {
        return NextResponse.json(
          { error: 'limit_reached', limitReached: true, plan: profile.plan, limit: profile.limit },
          { status: 403 }
        );
      }
      streak = await recordUsage(profile);
    } else {
      // Anonymous (no token or invalid/expired token) — IP-capped trial.
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const allowed = await checkAnonymousLimit(ip);
      if (!allowed) {
        return NextResponse.json({ error: 'limit_reached', limitReached: true, plan: 'anonymous' }, { status: 403 });
      }
    }

    const prompt = buildPrompt(forceType, idea, profile?.memory ?? null);
    const gen = await callGemini(prompt, forceType);

    if (!gen.ok) {
      // ✅ Honest failure with a real error status — previously this path
      // returned HTTP 200 with "Server crashed", which hid failures from
      // monitoring and showed users broken empty cards.
      return NextResponse.json(
        {
          error: gen.rateLimited ? 'rate_limited' : 'generation_failed',
          message: gen.rateLimited
            ? 'CRÉO is at capacity right now — please try again in about a minute.'
            : 'Generation failed — please try again.',
        },
        { status: gen.rateLimited ? 429 : 502 }
      );
    }

    const text = gen.text;

    if (forceType === "titles") {
      const titles = text.split("\n").map((t) => t.trim()).filter((t) => t.length > 0).slice(0, 6);
      return NextResponse.json({ type: "titles", titles, streak });
    }

    if (forceType === "hooks") {
      const hooks = text.split(/\n\n+/).map((h) => h.trim()).filter((h) => h.length > 0).slice(0, 3);
      return NextResponse.json({ type: "hooks", hooks, streak });
    }

    if (forceType === "assistant") {
      return NextResponse.json({ type: "assistant", result: text, streak });
    }

    if (forceType === "review") {
      return NextResponse.json({ type: "review", result: text, streak });
    }

    if (forceType === "expand") {
      return NextResponse.json({ type: "expand", result: text, streak });
    }

    if (forceType === "competitor") {
      return NextResponse.json({ type: "competitor", result: text, streak });
    }

    return NextResponse.json({ type: "script", result: text, streak });

  } catch (err: any) {
    console.error('generate route error:', err?.message);
    // ✅ DIAGNOSTIC: the single most common cause of "error in generation" is
    // the Vercel env var being named "service_role" instead of the exact
    // SUPABASE_SERVICE_ROLE_KEY. Surface that clearly instead of a generic error.
    const isConfigError = typeof err?.message === 'string' && err.message.includes('Supabase admin client is not configured');
    return NextResponse.json(
      {
        error: isConfigError ? 'server_misconfigured' : 'generation_failed',
        message: isConfigError
          ? 'Server setup issue: SUPABASE_SERVICE_ROLE_KEY is missing or misnamed in Vercel — rename the env var and redeploy.'
          : 'Something went wrong — please try again.',
      },
      { status: 500 }
    );
  }
}
