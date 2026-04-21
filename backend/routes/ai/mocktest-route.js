
const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
  try {
    const { trackSlug, tier = "Beginner", questionCount = 5 } = req.body;

    if (!trackSlug) {
      return res.status(400).json({ error: "trackSlug is required" });
    }

    const count = Math.min(10, Math.max(3, parseInt(questionCount) || 5));
    const trackName = TRACK_NAMES[trackSlug] || trackSlug;

    const prompt = `You are an expert technical quiz generator.

Generate exactly ${count} multiple-choice questions (MCQ) about "${trackName}" at ${tier} level.

Rules:
- Each question must have exactly 4 options.
- The "answer" field must EXACTLY match one of the options strings.
- Include a brief "explanation" (1-2 sentences) for the correct answer.
- Questions must be clear and appropriate for ${tier} level.
- No code blocks. Text-based questions only.
- Vary topics broadly within "${trackName}".

Respond ONLY with a valid JSON array. No markdown, no extra text.

[
  {
    "q": "Question text?",
    "options": ["Option one", "Option two", "Option three", "Option four"],
    "answer": "Option two",
    "explanation": "Brief explanation."
  }
]`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a technical quiz generator. Respond with valid JSON array only. No markdown." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let questions;
    try {
      questions = JSON.parse(cleaned);
    } catch {
      console.error("Groq returned invalid JSON:", raw);
      return res.status(500).json({ error: "AI returned invalid response. Please try again." });
    }

    const valid = questions
      .filter((q) =>
        q.q &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.answer &&
        q.options.includes(q.answer)
      )
      .slice(0, count)
      .map((q) => ({
        type: "mcq",
        q: q.q,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation || "",
      }));

    if (valid.length === 0) {
      return res.status(500).json({ error: "Could not generate valid questions. Please try again." });
    }

    return res.json({ questions: valid, total: valid.length });
  } catch (err) {
    console.error("MockTest Groq error:", err?.message || err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;