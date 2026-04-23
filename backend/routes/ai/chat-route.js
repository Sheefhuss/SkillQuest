const express = require("express");
const router = express.Router();
const { groqChat } = require("../../utils/groqClient");

router.post("/chat", async (req, res) => {
  const { prompt, history = [] } = req.body;

  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  try {
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

    const text = await groqChat(messages, { temperature: 0.7, max_tokens: 1024 });
    res.json({ text: text || "Sorry, I couldn't process that." });
  } catch (err) {
    console.error("Chat error:", err?.message);
    res.status(err.status || 500).json({ text: "AI backend error. Please try again." });
  }
});

module.exports = router;
