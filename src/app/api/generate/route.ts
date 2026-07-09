import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// ✅ The actual enforcement — real limits per plan, checked and written
// server-side. Before this, the count only ever lived in localStorage,
// which anyone could clear or bypass entirely by calling this route directly.
const PLAN_LIMITS: Record<string, number> = { free: 3, pro: 100, ultra: Infinity };
const ANON_DAILY_LIMIT = 3; // matches the free tier — the /try trial shouldn't out-give the free plan

// ✅ COST OPTIMIZATION — two levers, both big:
//
// 1. Model routing: titles/hooks/assistant are simple tasks → Flash-Lite
//    (cheapest Gemini model, ~4x higher free-tier daily allowance, faster).
//    Only full scripts use Flash. On the free tier this multiplies how many
//    generations per day CRÉO can serve before hitting rate limits.
//
// 2. Thinking disabled (thinkingBudget: 0): Gemini 2.5 Flash "thinks" by
//    default, silently burning 5–10x more output tokens per request on
//    internal reasoning these tasks don't need. Off = cheaper AND faster.
const MODEL_FOR: Record<string, string> = {
  titles: "gemini-2.5-flash-lite",
  hooks: "gemini-2.5-flash-lite",
  assistant: "gemini-2.5-flash-lite",
  script: "gemini-2.5-flash",
};
const MAX_TOKENS_FOR: Record<string, number> = {
  titles: 512,
  hooks: 512,
  assistant: 512,
  script: 4096, // generous cap so long scripts never truncate, but a runaway response can't blow the token budget
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

// ✅ Checks + records usage for a signed-in user, verified via their real
// Supabase session token — never trusts a client-supplied user ID, since
// that could be spoofed to attribute usage (or bypass limits) to someone else.
async function checkAuthenticatedLimit(token: string): Promise<{ allowed: boolean; plan: string; limit: number } | null> {
  const admin = getSupabaseAdmin();
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return null; // invalid/expired token — fall through to anonymous handling

  const userId = userData.user.id;
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, daily_gen_count, daily_gen_reset_date')
    .eq('user_id', userId)
    .single();

  const plan = profile?.plan || 'free';
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const today = todayDate();
  const isNewDay = !profile || profile.daily_gen_reset_date !== today;
  const currentCount = isNewDay ? 0 : (profile.daily_gen_count || 0);

  if (currentCount >= limit) {
    return { allowed: false, plan, limit };
  }

  // Record the usage now — if generation fails after this, that's an
  // acceptable trade-off vs. the complexity of a rollback, and matches how
  // the old client-only counter behaved too.
  await admin.from('profiles').update({
    daily_gen_count: currentCount + 1,
    daily_gen_reset_date: today,
  }).eq('user_id', userId);

  return { allowed: true, plan, limit };
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

export async function POST(req: NextRequest) {
  try {
    // ✅ Limit check happens before any Gemini call — a blocked request
    // shouldn't cost anything.
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
      const result = await checkAuthenticatedLimit(token);
      if (result && !result.allowed) {
        return NextResponse.json(
          { error: 'limit_reached', limitReached: true, plan: result.plan, limit: result.limit },
          { status: 403 }
        );
      }
      // If result is null (invalid token), fall through to anonymous handling below.
      if (!result) {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const allowed = await checkAnonymousLimit(ip);
        if (!allowed) {
          return NextResponse.json({ error: 'limit_reached', limitReached: true, plan: 'anonymous' }, { status: 403 });
        }
      }
    } else {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const allowed = await checkAnonymousLimit(ip);
      if (!allowed) {
        return NextResponse.json({ error: 'limit_reached', limitReached: true, plan: 'anonymous' }, { status: 403 });
      }
    }

    const body = await req.json();
    const idea: string = body.idea || "make a video";
    const forceType: string = body.forceType || "script";

    let prompt = "";

    // ✅ Anti-bot prompt hardening (Week 1 item) — every prompt bans the
    // filler phrases that make output feel AI-written, and hooks are forced
    // into proven viral frameworks instead of "make it shocking".
    if (forceType === "titles") {
      prompt = `You are a YouTube title strategist who studies what actually gets clicked. Generate exactly 6 viral YouTube titles for this topic: "${idea}".
Rules:
- Each title on a new line
- No numbering, no bullet points, no extra text
- Mix these proven patterns across the 6: curiosity gap, bold specific claim, negative framing ("stop doing X"), number + payoff, personal stakes ("I tried X"), open question
- Under 60 characters each where possible
- Sound like a human creator wrote them. NEVER use: ${BANNED_PHRASES}
- Only output the 6 titles, nothing else`;

    } else if (forceType === "hooks") {
      prompt = `You are a YouTube hook writer who studies audience retention. Generate exactly 3 opening hooks for a YouTube video titled: "${idea}".
Rules:
- Each hook on a new line, separated by a blank line
- Each hook is 1-3 sentences max, written to be SPOKEN aloud
- Use one of each: (1) curiosity gap — tease the payoff without revealing it, (2) stakes/negativity — what goes wrong if they skip this, (3) bold claim or open loop backed by a specific detail
- Concrete and specific beats dramatic and vague. NEVER use: ${BANNED_PHRASES}
- No numbering, no bullet points, no labels
- Only output the 3 hooks, nothing else`;

    } else if (forceType === "assistant") {
      // ✅ Nova AI assistant — conversational content helper
      prompt = `You are Nova, an expert AI content co-writer inside CRÉO, a viral content creation app.
The user is a content creator asking for help with their video content.
Be concise, friendly, and actionable. Max 3-4 sentences per response.
Never use: ${BANNED_PHRASES}.
Help with: improving titles, hooks, scripts, CTAs, tone, structure, or any content request.

User request: "${idea}"`;

    } else {
      prompt = `You are a professional YouTube scriptwriter whose scripts sound like a real person talking, never like AI. Write a full YouTube script for: "${idea}".
Format:
- Use clear section headers like [INTRO - 0:00-0:15]
- Include timestamps
- Write naturally and conversationally — short sentences, contractions, direct address ("you")
- Open with the hook immediately, no channel intro or greeting
- End with ONE specific CTA, not a generic "like and subscribe"
- NEVER use: ${BANNED_PHRASES}`;
    }

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
      return NextResponse.json({ type: "titles", titles });
    }

    if (forceType === "hooks") {
      const hooks = text.split(/\n\n+/).map((h) => h.trim()).filter((h) => h.length > 0).slice(0, 3);
      return NextResponse.json({ type: "hooks", hooks });
    }

    if (forceType === "assistant") {
      return NextResponse.json({ type: "assistant", result: text });
    }

    return NextResponse.json({ type: "script", result: text });

  } catch (err: any) {
    console.error('generate route error:', err?.message);
    return NextResponse.json(
      { error: 'generation_failed', message: 'Something went wrong — please try again.' },
      { status: 500 }
    );
  }
}
