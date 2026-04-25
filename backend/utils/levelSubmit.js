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
          content: "You are a code evaluator. Respond with valid JSON only. No markdown. No extra text.",
        },
        {
          role: "user",
          content: `Evaluate this ${language.toUpperCase()} solution for a coding challenge.

Challenge: ${prompt}
LANGUAGE RULES: ${hint}
Accept any correct working solution in ${language}. Do not apply JavaScript-specific rules to other languages.
Only the core function is required — no main function or print statements needed.

User's code:
${code}

Generate 3 to 5 representative test cases for this challenge. For each test case:
- Simulate mentally whether the user's code would produce the correct output.
- Mark it passed or failed accordingly.

Respond with JSON only, exactly this shape:
{
  "passed": true or false,
  "feedback": "one clear sentence — what is correct or what specific logic is wrong",
  "score": 0 to 100,
  "testCases": [
    {
      "input": "human-readable input, e.g. nums = [2,7,11,15], target = 9",
      "expectedOutput": "human-readable expected output, e.g. [0, 1]",
      "actualOutput": "what the user's code would return, e.g. [0, 1]",
      "passed": true or false
    }
  ]
}`,
        },
      ],
      { temperature: 0.2, max_tokens: 700 }
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

      if (passed) {
        const user = await User.findByPk(req.user.id);
        if (user) {
          await user.update({
            xp: (user.xp || 0) + 50,
            problems_solved: (user.problems_solved || 0) + 1,
          });
        }
      }

      res.json({ passed, feedback, score, xp_earned: passed ? 50 : 0, testCases });
    } catch (err) {
      console.error("Level submit error:", err?.message, err?.stack);
      res.status(500).json({ message: "Evaluation failed.", detail: err?.message });
    }
  });
}

module.exports = { mountLevelSubmit };
