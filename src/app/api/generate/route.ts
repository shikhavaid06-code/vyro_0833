import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// ✅ The actual enforcement — real limits per plan, checked and written
// server-side. Before this, the count only ever lived in localStorage,
// which anyone could clear or bypass entirely by calling this route directly.
const PLAN_LIMITS: Record<string, number> = { free: 3, pro: 100, ultra: Infinity };
const ANON_DAILY_LIMIT = 3; // matches the free tier — the /try trial shouldn't out-give the free plan

function todayDate(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

async function callGemini(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    if (response.status === 503) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No output";
  }
  throw new Error("Gemini overloaded after retries");
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

    if (forceType === "titles") {
      prompt = `You are a YouTube title expert. Generate exactly 6 viral YouTube titles for this topic: "${idea}".
Rules:
- Each title on a new line
- No numbering, no bullet points, no extra text
- Make them curiosity-driven and click-worthy
- Only output the 6 titles, nothing else`;

    } else if (forceType === "hooks") {
      prompt = `You are a YouTube hook writer. Generate exactly 3 powerful opening hooks for a YouTube video titled: "${idea}".
Rules:
- Each hook on a new line, separated by a blank line
- Each hook should be 1-3 sentences max
- Make them emotional, curiosity-driven, or shocking
- No numbering, no bullet points
- Only output the 3 hooks, nothing else`;

    } else if (forceType === "assistant") {
      // ✅ Nova AI assistant — conversational content helper
      prompt = `You are Nova, an expert AI content co-writer inside VYRO, a viral content creation app.
The user is a content creator asking for help with their video content.
Be concise, friendly, and actionable. Max 3-4 sentences per response.
Help with: improving titles, hooks, scripts, CTAs, tone, structure, or any content request.

User request: "${idea}"`;

    } else {
      prompt = `You are a professional YouTube scriptwriter. Write a full YouTube script for: "${idea}".
Format:
- Use clear section headers like [INTRO - 0:00-0:15]
- Include timestamps
- Write naturally, conversationally
- End with a strong CTA
- Make it engaging and viral-worthy`;
    }

    const text = await callGemini(prompt);

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
    return NextResponse.json(
      { error: "Server crashed", message: err.message },
      { status: 200 }
    );
  }
}
