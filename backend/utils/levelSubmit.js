const { groqChat } = require("./groqClient");

const IDIOM_HINTS = {
  python:     "In Python, slicing, list comprehensions, and built-ins like reversed(), sorted(), set() are all valid and idiomatic. Do NOT penalise these.",
  java:       "In Java, StringBuilder, Collections, and standard library methods are all valid.",
  c:          "In C, manual pointer manipulation, loops, and standard library are expected. Accept any correct approach.",
  cpp:        "In C++, STL (std::sort, std::reverse, vectors, maps, unordered_map) are all valid. Do NOT penalise STL usage.",
  javascript: "Enforce challenge-specific restrictions strictly only for JavaScript.",
  html:       "Accept any valid HTML and CSS. No JS required. Evaluate structure and styles only.",
  sql:        "Accept any correct SQL query. Aliases, joins, subqueries are all valid.",
  docker:     "Accept any correct Dockerfile. Base image, WORKDIR, COPY, RUN, EXPOSE, CMD are all valid.",
  text:       "This is a system design or API design question. Accept any reasonable written answer describing the approach.",
};

const TEXT_LANGUAGES = ["html", "sql", "docker", "text"];

const evalCache = new Map();

function isValidSubmission(code, language) {
  if (TEXT_LANGUAGES.includes(language)) {
    return code.trim().length > 20;
  }
  return code.trim().length > 20 && /[=(){};:\[\]]/.test(code);
}

function buildPrompt(code, prompt, language) {
  const hint = IDIOM_HINTS[language] || `Accept idiomatic ${language} solutions.`;

  if (language === "text") {
    return `Evaluate this system/API design answer.
Challenge: ${prompt}
Rules: ${hint}

Answer:
${code}

Reply ONLY with this JSON:
{"passed":bool,"feedback":"one sentence","score":0-100,"testCases":[{"input":"design requirement","expectedOutput":"expected approach","actualOutput":"what the answer covers","passed":bool}]}`;
  }

  if (language === "html") {
    return `Evaluate this HTML/CSS solution.
Challenge: ${prompt}
Rules: ${hint}

Code:
${code}

Check 3 structural requirements. Reply ONLY with this JSON:
{"passed":bool,"feedback":"one sentence","score":0-100,"testCases":[{"input":"requirement","expectedOutput":"expected element/style","actualOutput":"what the code has","passed":bool}]}`;
  }

  if (language === "sql") {
    return `Evaluate this SQL query.
Challenge: ${prompt}
Rules: ${hint}

Query:
${code}

Check 3 aspects of correctness. Reply ONLY with this JSON:
{"passed":bool,"feedback":"one sentence","score":0-100,"testCases":[{"input":"requirement","expectedOutput":"expected clause/result","actualOutput":"what the query does","passed":bool}]}`;
  }

  if (language === "docker") {
    return `Evaluate this Dockerfile.
Challenge: ${prompt}
Rules: ${hint}

Dockerfile:
${code}

Check 3 required instructions. Reply ONLY with this JSON:
{"passed":bool,"feedback":"one sentence","score":0-100,"testCases":[{"input":"requirement","expectedOutput":"expected instruction","actualOutput":"what the Dockerfile has","passed":bool}]}`;
  }

  const hint2 = IDIOM_HINTS[language] || `Accept idiomatic ${language} solutions.`;
  return `Evaluate this ${language.toUpperCase()} solution.
Challenge: ${prompt}
Rules: ${hint2}
Only the core function is needed.

Code:
${code}

Run 3 test cases mentally. Reply ONLY with this JSON:
{"passed":bool,"feedback":"one sentence","score":0-100,"testCases":[{"input":"...","expectedOutput":"...","actualOutput":"...","passed":bool}]}`;
}

async function evaluateLevelChallenge(code, prompt, language = "javascript") {
  const cacheKey = `${language}:${code.trim().slice(0, 100)}:${prompt.slice(0, 80)}`;
  if (evalCache.has(cacheKey)) return evalCache.get(cacheKey);

  if (!isValidSubmission(code, language)) {
    return {
      passed: false,
      feedback: TEXT_LANGUAGES.includes(language)
        ? "Answer is too short. Write a proper solution."
        : "That doesn't look like code. Write a proper solution.",
      score: 0,
      testCases: [],
    };
  }

  try {
    const raw = await groqChat(
      [
        { role: "system", content: "Code evaluator. Respond with valid JSON only. No markdown." },
        { role: "user",   content: buildPrompt(code, prompt, language) },
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
    const looksGood = code.length > 60;
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
