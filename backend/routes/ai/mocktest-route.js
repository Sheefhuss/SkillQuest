const express = require("express");
const router = express.Router();
const { groqChat } = require("../../utils/groqClient");

const TRACK_NAMES = {
  fullstack: "Full Stack Web Development",
  webdev: "Web Development (HTML, CSS, JavaScript)",
  dsa: "Data Structures & Algorithms",
  systemdesign: "System Design",
  databases: "Databases (SQL, NoSQL, ORMs)",
  devops: "DevOps (Docker, CI/CD, Linux, Cloud)",
  apis: "APIs & Integrations (REST, GraphQL, Auth)",
};

router.post("/mocktest", async (req, res) => {
  const { trackSlug, tier = "Beginner", questionCount = 5 } = req.body;

  if (!trackSlug) return res.status(400).json({ error: "trackSlug is required" });

  const count = Math.min(10, Math.max(3, parseInt(questionCount) || 5));
  const trackName = TRACK_NAMES[trackSlug] || trackSlug;

  const prompt = `Generate exactly ${count} multiple-choice questions about "${trackName}" at ${tier} level.

Rules:
- Each question must have exactly 4 options
- The "answer" field must EXACTLY match one of the option strings
- Include a brief "explanation" (1-2 sentences) for the correct answer
- Vary topics broadly within "${trackName}"

Respond ONLY with a valid JSON array. No markdown, no extra text.

[
  {
    "q": "Question text?",
    "options": ["Option one", "Option two", "Option three", "Option four"],
    "answer": "Option two",
    "explanation": "Brief explanation."
  }
]`;

  try {
    const raw = await groqChat(
      [
        { role: "system", content: "You are a technical quiz generator. Respond with valid JSON array only." },
        { role: "user", content: prompt },
      ],
      { temperature: 0.7, max_tokens: 2000 }
    );

    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    let questions;

    try {
      questions = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: "AI returned invalid response. Please try again." });
    }

    const valid = questions
      .filter((q) => q.q && Array.isArray(q.options) && q.options.length === 4 && q.answer && q.options.includes(q.answer))
      .slice(0, count)
      .map((q) => ({ type: "mcq", q: q.q, options: q.options, answer: q.answer, explanation: q.explanation || "" }));

    if (valid.length === 0) {
      return res.status(500).json({ error: "Could not generate valid questions. Please try again." });
    }

    res.json({ questions: valid, total: valid.length });
  } catch (err) {
    console.error("MockTest error:", err?.message);
    res.status(err.status || 500).json({ error: "Internal server error." });
  }
});

module.exports = router;
