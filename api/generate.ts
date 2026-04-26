module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ message: "API is working" });
    }

    const idea = req.body?.idea || "test idea";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful content creator." },
          { role: "user", content: `Create a short script about: ${idea}` },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI failed",
        details: data,
      });
    }

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content || "No output",
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server crashed",
    });
  }
};
