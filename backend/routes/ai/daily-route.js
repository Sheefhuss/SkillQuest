const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const DailyChallenge = require("../../models/DailyChallenge");
const Submission = require("../../models/Submission");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || "skillquest_secret_key";

const today = () => new Date().toISOString().split("T")[0];

function getUser(req) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

const DAILY_POOL = [
  { title: "Reverse a String", difficulty: "Easy", prompt: "Write a function that reverses a string without using .reverse().\n\nExample:\nInput: 'hello' → Output: 'olleh'\nInput: 'SkillQuest' → Output: 'tseuQllikS'", starter_code: "function reverseString(str) {\n  \n}", expected_concepts: ["split", "join", "loop"], xp_reward: 75 },
  { title: "FizzBuzz Classic", difficulty: "Easy", prompt: "Return an array from 1 to n. Multiples of 3 → 'Fizz', multiples of 5 → 'Buzz', both → 'FizzBuzz'.\n\nExample:\nInput: 15 → [1,2,'Fizz',4,'Buzz','Fizz',7,8,'Fizz','Buzz',11,'Fizz',13,14,'FizzBuzz']", starter_code: "function fizzBuzz(n) {\n  \n}", expected_concepts: ["modulo", "loop", "push"], xp_reward: 75 },
  { title: "Palindrome Check", difficulty: "Easy", prompt: "Check if a string is a palindrome. Ignore spaces and case.\n\nExample:\nInput: 'racecar' → true\nInput: 'A man a plan a canal Panama' → true\nInput: 'hello' → false", starter_code: "function isPalindrome(str) {\n  \n}", expected_concepts: ["reverse", "toLowerCase", "replace"], xp_reward: 75 },
  { title: "Count Vowels", difficulty: "Easy", prompt: "Count the number of vowels (a,e,i,o,u) in a string. Case insensitive.\n\nExample:\nInput: 'Hello World' → 3\nInput: 'JavaScript' → 3", starter_code: "function countVowels(str) {\n  \n}", expected_concepts: ["match", "filter", "regex"], xp_reward: 75 },
  { title: "Two Sum Problem", difficulty: "Medium", prompt: "Given an array and a target, return indices of two numbers that add to target.\n\nExample:\nInput: [2,7,11,15], target=9 → [0,1]\nInput: [3,2,4], target=6 → [1,2]", starter_code: "function twoSum(nums, target) {\n  \n}", expected_concepts: ["map", "hash", "object"], xp_reward: 75 },
  { title: "Anagram Checker", difficulty: "Medium", prompt: "Check if two strings are anagrams. Ignore spaces and case.\n\nExample:\nInput: 'listen', 'silent' → true\nInput: 'hello', 'world' → false", starter_code: "function isAnagram(str1, str2) {\n  \n}", expected_concepts: ["sort", "split", "join"], xp_reward: 75 },
  { title: "Flatten Nested Array", difficulty: "Medium", prompt: "Flatten a nested array to a single level without Array.flat().\n\nExample:\nInput: [1,[2,[3,[4]],5]] → [1,2,3,4,5]\nInput: [[1,2],[3,[4,5]]] → [1,2,3,4,5]", starter_code: "function flattenArray(arr) {\n  \n}", expected_concepts: ["recursion", "concat", "reduce"], xp_reward: 75 },
  { title: "Fibonacci Sequence", difficulty: "Medium", prompt: "Return the nth Fibonacci number. Sequence: 0,1,1,2,3,5,8...\n\nExample:\nInput: 6 → 8\nInput: 10 → 55", starter_code: "function fibonacci(n) {\n  \n}", expected_concepts: ["recursion", "loop", "memoization"], xp_reward: 75 },
  { title: "Remove Duplicates", difficulty: "Easy", prompt: "Remove all duplicate values from an array.\n\nExample:\nInput: [1,2,2,3,4,4,5] → [1,2,3,4,5]\nInput: ['a','b','a','c'] → ['a','b','c']", starter_code: "function removeDuplicates(arr) {\n  \n}", expected_concepts: ["set", "filter", "includes"], xp_reward: 75 },
  { title: "Chunk Array", difficulty: "Medium", prompt: "Split an array into chunks of a given size.\n\nExample:\nInput: [1,2,3,4,5], size=2 → [[1,2],[3,4],[5]]\nInput: [1,2,3,4,5,6], size=3 → [[1,2,3],[4,5,6]]", starter_code: "function chunkArray(arr, size) {\n  \n}", expected_concepts: ["slice", "push", "loop"], xp_reward: 75 },
  { title: "Capitalize Words", difficulty: "Easy", prompt: "Capitalize the first letter of every word in a sentence.\n\nExample:\nInput: 'hello world' → 'Hello World'\nInput: 'javascript is awesome' → 'Javascript Is Awesome'", starter_code: "function capitalizeWords(str) {\n  \n}", expected_concepts: ["split", "map", "join", "toUpperCase"], xp_reward: 75 },
  { title: "Longest Word Finder", difficulty: "Easy", prompt: "Find the longest word in a sentence. Return the first if tied.\n\nExample:\nInput: 'The quick brown fox' → 'quick'\nInput: 'I love JavaScript programming' → 'programming'", starter_code: "function longestWord(sentence) {\n  \n}", expected_concepts: ["split", "reduce", "length"], xp_reward: 75 },
  { title: "Sum Nested Numbers", difficulty: "Hard", prompt: "Recursively sum all numbers in a deeply nested array.\n\nExample:\nInput: [1,[2,[3,[4]]]] → 10\nInput: [1,[2,3],[4,[5,6]]] → 21", starter_code: "function sumNested(arr) {\n  \n}", expected_concepts: ["recursion", "reduce", "isArray"], xp_reward: 75 },
  { title: "Binary Search", difficulty: "Hard", prompt: "Implement binary search on a sorted array. Return the index or -1 if not found.\n\nExample:\nInput: [1,3,5,7,9,11], target=7 → 3\nInput: [1,3,5,7,9], target=6 → -1", starter_code: "function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  \n}", expected_concepts: ["while", "mid", "left", "right"], xp_reward: 75 },
  { title: "Find the Unique", difficulty: "Medium", prompt: "Every number appears twice except one. Find the unique number.\n\nExample:\nInput: [2,3,5,3,2] → 5\nInput: [7,1,7] → 1", starter_code: "function findUnique(nums) {\n  \n}", expected_concepts: ["xor", "set", "filter"], xp_reward: 75 },
];

const WEEKLY_POOL = [
  { title: "Implement Debounce", difficulty: "Hard", prompt: "Implement a debounce function that delays invoking a function until after wait ms since the last call.\n\nExample:\nconst debounced = debounce(fn, 300);\n// fn only fires 300ms after last call\n\nThis is a core frontend interview concept.", starter_code: "function debounce(fn, delay) {\n  \n}", expected_concepts: ["setTimeout", "clearTimeout", "closure"], xp_reward: 150 },
  { title: "Deep Object Clone", difficulty: "Hard", prompt: "Deep clone a JS object without JSON.parse/stringify. Handle nested objects and arrays.\n\nExample:\nInput: { a: 1, b: { c: 2, d: [3,4] } }\nModifying the clone must NOT affect the original.", starter_code: "function deepClone(obj) {\n  \n}", expected_concepts: ["recursion", "isArray", "typeof"], xp_reward: 150 },
  { title: "Event Emitter Class", difficulty: "Hard", prompt: "Implement EventEmitter with on(), off(), emit().\n\nExample:\nconst e = new EventEmitter();\ne.on('click', handler);\ne.emit('click', 'data');\ne.off('click', handler);", starter_code: "class EventEmitter {\n  constructor() {}\n  on(event, listener) {}\n  off(event, listener) {}\n  emit(event, ...args) {}\n}", expected_concepts: ["class", "map", "filter", "listeners"], xp_reward: 150 },
];

async function getOrCreateToday() {
  const date = today();
  const existing = await DailyChallenge.findAll({ where: { date } });
  if (existing.length > 0) return existing;

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const daily = DAILY_POOL[dayOfYear % DAILY_POOL.length];
  const weekly = WEEKLY_POOL[Math.floor(dayOfYear / 7) % WEEKLY_POOL.length];

  try {
    return await DailyChallenge.bulkCreate([
      { ...daily, date, is_weekly: false },
      { ...weekly, date, is_weekly: true },
    ]);
  } catch (err) {
    console.warn("Pool insert failed, falling back to Groq:", err.message);
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Respond with valid JSON only. No markdown." },
        { role: "user", content: 'Generate a Medium JS challenge as JSON: {"title":"...","difficulty":"Medium","prompt":"...with 2 examples","starter_code":"function solution(){}","expected_concepts":["a","b"],"xp_reward":75}' },
      ],
      temperature: 0.9,
      max_tokens: 500,
    });
    const raw = completion.choices[0]?.message?.content || "{}";
    const challenge = JSON.parse(raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim());
    return await DailyChallenge.bulkCreate([
      { ...challenge, date, is_weekly: false },
      { ...WEEKLY_POOL[0], date, is_weekly: true },
    ]);
  }
}

async function evaluateSubmission(code, challenge) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a code evaluator. Respond with valid JSON only. No markdown, no explanation outside JSON.",
        },
        {
          role: "user",
          content: `Evaluate this JavaScript solution for the following challenge.

Challenge: ${challenge.title}
Problem: ${challenge.prompt}
Expected concepts: ${(challenge.expected_concepts || []).join(", ")}

User's code:
${code}

Respond with JSON only:
{
  "passed": true or false,
  "feedback": "one sentence explaining why it passed or what's wrong",
  "score": 0 to 100
}

Rules:
- passed = true if the code correctly solves the problem
- passed = false if it's incomplete, wrong logic, or just a comment
- Be strict but fair`,
        },
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim());
    return {
      passed: result.passed === true,
      feedback: result.feedback || "Evaluated.",
      score: result.score || 0,
    };
  } catch {
    
    const hasConcept = (challenge.expected_concepts || []).some((c) =>
      code.toLowerCase().includes(c.toLowerCase())
    );
    const looksLikeCode = code.length > 30 && /[{}()=;]/.test(code);
    const passed = looksLikeCode && (hasConcept || code.length > 120);
    return {
      passed,
      feedback: passed ? "Looks good!" : "Missing key concepts or too short.",
      score: passed ? 75 : 0,
    };
  }
}

router.get("/daily", async (req, res) => {
  try {
    res.json(await getOrCreateToday());
  } catch (err) {
    console.error("Daily route error:", err?.message || err);
    res.status(500).json({ error: "Failed to load daily challenge." });
  }
});

router.get("/daily/archive", async (req, res) => {
  try {
    const archive = await DailyChallenge.findAll({
      order: [["date", "DESC"]],
      limit: 30,
    });
    res.json(archive);
  } catch (err) {
    res.status(500).json({ error: "Failed to load archive." });
  }
});

router.post("/daily/submit", async (req, res) => {
  const authUser = getUser(req);
  if (!authUser) return res.status(401).json({ error: "Not authenticated." });

  const { challenge_id, code } = req.body;
  if (!challenge_id || !code?.trim()) {
    return res.status(400).json({ error: "challenge_id and code are required." });
  }

  try {
    const challenge = await DailyChallenge.findByPk(challenge_id);
    if (!challenge) return res.status(404).json({ error: "Challenge not found." });

    const attempts = await Submission.findAll({
      where: { challenge_id, user_email: authUser.email },
    });
    if (attempts.length >= 3) {
      return res.status(400).json({ error: "Out of attempts for today." });
    }

    const alreadyPassed = attempts.some((a) => a.passed);
    if (alreadyPassed) {
      return res.status(400).json({ error: "Already solved!" });
    }

    const timeTaken = Math.floor((Date.now() - (req.body.start_time || Date.now())) / 1000);
    
    const { passed, feedback, score } = await evaluateSubmission(code, challenge);

    let xpEarned = 0;
    if (passed) {
      xpEarned = challenge.xp_reward;
      if (!challenge.is_weekly && timeTaken < 1800) xpEarned += 25;

      const user = await User.findOne({ where: { email: authUser.email } });
      if (user) {
        const newBadges = [...(user.badges || [])];

        if (!challenge.is_weekly && timeTaken < 1800 && !newBadges.includes("speed_coder")) {
          newBadges.push("speed_coder");
        }
        if ((user.problems_solved || 0) + 1 >= 100 && !newBadges.includes("hundred_club")) {
          newBadges.push("hundred_club");
        }

        await user.update({
          xp: (user.xp || 0) + xpEarned,
          problems_solved: (user.problems_solved || 0) + 1,
          badges: newBadges,
        });
      }
    }

    const submission = await Submission.create({
      challenge_id,
      user_email: authUser.email,
      code,
      passed,
      attempts: attempts.length + 1,
      time_taken_seconds: timeTaken,
      xp_earned: xpEarned,
      ai_feedback: feedback,
    });

    res.json({
      passed,
      feedback,
      score,
      xp_earned: xpEarned,
      attempts_used: attempts.length + 1,
      submission,
    });
  } catch (err) {
    console.error("Submit error:", err?.message || err);
    res.status(500).json({ error: "Submission failed." });
  }
});

router.post("/daily/seed", async (req, res) => {
  try {
    await DailyChallenge.destroy({ where: { date: today() } });
    res.json({ message: "Seeded!", challenges: await getOrCreateToday() });
  } catch (err) {
    res.status(500).json({ error: "Seed failed." });
  }
});

module.exports = router;
