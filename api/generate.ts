export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { idea } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a viral content creator.",
          },
          {
            role: "user",
            content: `Create a short engaging script about: ${idea}`,
          },
        ],
      }),
    });

    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content || "No response";

    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
