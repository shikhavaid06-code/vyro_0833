module.exports = async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ message: "API working" });
    }

    const idea = req.body?.idea || "test idea";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `Create a YouTube script about: ${idea}` }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini failed",
        details: data,
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No output";

    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
    });
  }
};
