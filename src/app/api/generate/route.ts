import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
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

    return NextResponse.json({ type: "script", result: text });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Server crashed", message: err.message },
      { status: 200 }
    );
  }
}
