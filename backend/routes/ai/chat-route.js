const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/chat", async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const messages = [
      {
        role: "system",
        content: `You are SkillQuest AI Tutor — a friendly, expert coding mentor.
You help learners with programming concepts, algorithms, system design, databases, DevOps, and web development.
Keep answers clear, concise, and educational. Use markdown formatting with code blocks where relevant.
If asked to explain something, give a simple analogy first, then the technical detail.
If asked for a harder problem, include constraints and examples.
Never refuse a coding question. Always be encouraging.`,
      },
      ...history.slice(-10),
      { role: "user", content: prompt },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";
    return res.json({ text });

  } catch (err) {
    console.error("AI Chat Groq error:", err?.message || err);
    return res.status(500).json({ text: "AI backend error. Please try again." });
  }
});

module.exports = router;