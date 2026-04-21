const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/mission", async (req, res) => {
  try {
    const { profile = {}, week_start } = req.body;

    const {
      username = "learner",
      xp = 0,
      level_tier = "Rookie",
      completed_levels = [],
      badges = [],
      activity_log = [],
    } = profile;

    const prompt = `You are SkillQuest AI Mission Strategist.

Generate a personalised weekly learning mission for this user:
- Username: ${username}
- XP: ${xp}
- Level tier: ${level_tier}
- Completed levels: ${completed_levels.length}
- Badges earned: ${badges.length > 0 ? badges.join(", ") : "none yet"}
- Recent activity: ${activity_log.length > 0 ? `${activity_log.length} sessions logged` : "just getting started"}

Create a mission that:
- It should match with their current skill level (${level_tier})
- Will pushes them slightly beyond their comfort zone
- Has a compelling narrative or story framing
- Has 3 clear, achievable objectives with realistic targets
- Feels exciting and gamified

Respond ONLY with a valid JSON object. No markdown, no extra text.

Format:
{
  "title": "Epic mission title (max 6 words)",
  "narrative": "2-3 sentence story framing that motivates the learner. Make it dramatic and exciting.",
  "difficulty": "Balanced",
  "xp_reward": 200,
  "objectives": [
    { "label": "Clear objective description", "target": 3, "progress": 0, "completed": false },
    { "label": "Clear objective description", "target": 1, "progress": 0, "completed": false },
    { "label": "Clear objective description", "target": 5, "progress": 0, "completed": false }
  ]
}

Rules:
- difficulty must be one of: "Easy", "Balanced", "Hard"
- xp_reward between 100 and 500 depending on difficulty
- objectives must have exactly 3 items
- target values should be realistic integers (1-10)
- Make the title and narrative unique and creative every time`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a game mission designer. Always respond with valid JSON only. No markdown, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content || "{}";

    const cleaned = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let mission;
    try {
      mission = JSON.parse(cleaned);
    } catch {
      console.error("Groq mission invalid JSON:", raw);
      return res.status(500).json({ error: "AI returned invalid response. Please try again." });
    }

    if (!mission.title || !mission.objectives || !Array.isArray(mission.objectives)) {
      return res.status(500).json({ error: "Invalid mission structure. Please try again." });
    }

    return res.json({
      title: mission.title,
      narrative: mission.narrative || "Your mission awaits.",
      difficulty: mission.difficulty || "Balanced",
      xp_reward: mission.xp_reward || 200,
      objectives: mission.objectives.slice(0, 3).map((o) => ({
        label: o.label || "Complete the objective",
        target: o.target || 1,
        progress: 0,
        completed: false,
      })),
      week_start,
    });

  } catch (err) {
    console.error("AI Mission Groq error:", err?.message || err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;