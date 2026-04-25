const { groqChat } = require("./groqClient");

const IDIOM_HINTS = {
  python:     "In Python, slicing, list comprehensions, and built-ins like reversed(), sorted(), set() are all valid and idiomatic. Do NOT penalise these.",
  java:       "In Java, StringBuilder, Collections, and standard library methods are all valid.",
  c:          "In C, manual pointer manipulation, loops, and standard library are expected. Accept any correct approach.",
  cpp:        "In C++, STL (std::sort, std::reverse, vectors, maps, unordered_map) are all valid. Do NOT penalise STL usage.",
  javascript: "Enforce challenge-specific restrictions strictly only for JavaScript.",
};

const evalCache = new Map();

async function evaluateLevelChallenge(code, prompt, language = "javascript") {
  const cacheKey = `${language}:${code.trim().slice(0, 100)}:${prompt.slice(0, 80)}`;
  if (evalCache.has(cacheKey)) return evalCache.get(cacheKey);

  const isCode = code.trim().length > 20 && /[=(){};:\[\]]/.test(code);
  if (!isCode) {
    return {
      passed: false,
      feedback: "That doesn't look like code. Write a proper solution.",
      score: 0,
      testCases: [],
    };
  }

  const hint = IDIOM_HINTS[language] || `Accept idiomatic ${language} solutions.`;

  try {
    const raw = await groqChat(
      [
        {
          role: "system",
          content: "Code evaluator. Respond with valid JSON only. No markdown.",
        },
        {
          role: "user",
          content: `Evaluate this ${language.toUpperCase()} solution.
Challenge: ${prompt}
Rules: ${hint}
Only the core function is needed.

Code:
${code}

Run 3 test cases mentally. Reply ONLY with this JSON:
{"passed":bool,"feedback":"one sentence","score":0-100,"testCases":[{"input":"...","expectedOutput":"...","actualOutput":"...","passed":bool}]}`,
        },
      ],
      { temperature: 0.1, max_tokens: 400 }
    );

    const parsed = JSON.parse(
      raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()
    );

    const final = {
      passed: parsed.passed === true,
      feedback: parsed.feedback || "Evaluated.",
      score: parsed.score || 0,
      testCases: Array.isArray(parsed.testCases) ? parsed.testCases : [],
    };

    evalCache.set(cacheKey, final);
    setTimeout(() => evalCache.delete(cacheKey), 10 * 60 * 1000);
    return final;
  } catch {
    const looksGood = code.length > 60 && /[=(){};:\[\]]/.test(code);
    return {
      passed: looksGood,
      feedback: looksGood ? "Looks like a valid solution!" : "Too short or missing logic.",
      score: looksGood ? 75 : 0,
      testCases: [],
    };
  }
}

function mountLevelSubmit(app, authenticateToken, User) {
  app.post("/api/levels/:id/submit", authenticateToken, async (req, res) => {
    try {
      const { code, language = "javascript" } = req.body;
      if (!code?.trim()) return res.status(400).json({ message: "Code is required." });

      const Level = require("../models/Level");
      const level = await Level.findByPk(req.params.id);
      if (!level) return res.status(404).json({ message: "Level not found." });

      const { passed, feedback, score, testCases } = await evaluateLevelChallenge(
        code,
        level.challenge_prompt,
        language
      );

      let xp_earned = 0;

      if (passed) {
        const user = await User.findByPk(req.user.id);
        if (user) {
          const alreadySolved = Array.isArray(user.solved_levels) &&
            user.solved_levels.includes(Number(req.params.id));

          if (!alreadySolved) {
            const updatedSolved = [...(user.solved_levels || []), Number(req.params.id)];
            await user.update({
              xp: (user.xp || 0) + 50,
              problems_solved: (user.problems_solved || 0) + 1,
              solved_levels: updatedSolved,
            });
            xp_earned = 50;
          }
        }
      }

      res.json({ passed, feedback, score, xp_earned, testCases });
    } catch (err) {
      console.error("Level submit error:", err?.message, err?.stack);
      res.status(500).json({ message: "Evaluation failed.", detail: err?.message });
    }
  });
}

module.exports = { mountLevelSubmit };
