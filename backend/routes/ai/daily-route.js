const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const DailyChallenge = require("../../models/DailyChallenge");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const today = () => new Date().toISOString().split("T")[0];
const DAILY_POOL = [
  { title: "Reverse a String", difficulty: "Easy", prompt: "Write a function that reverses a string without using .reverse().\n\nExample:\nInput: 'hello' → Output: 'olleh'\nInput: 'SkillQuest' → Output: 'tseuQllikS'", starter_code: "function reverseString(str) {\n   your code here\n}", expected_concepts: ["split", "join", "loop"], xp_reward: 75 },
  { title: "FizzBuzz Classic", difficulty: "Easy", prompt: "Return an array from 1 to n. Multiples of 3 → 'Fizz', multiples of 5 → 'Buzz', both → 'FizzBuzz'.\n\nExample:\nInput: 15 → [1,2,'Fizz',4,'Buzz','Fizz',7,8,'Fizz','Buzz',11,'Fizz',13,14,'FizzBuzz']", starter_code: "function fizzBuzz(n) {\n   your code here\n}", expected_concepts: ["modulo", "loop", "push"], xp_reward: 75 },
  { title: "Palindrome Check", difficulty: "Easy", prompt: "Check if a string is a palindrome. Ignore spaces and case.\n\nExample:\nInput: 'racecar' → true\nInput: 'A man a plan a canal Panama' → true\nInput: 'hello' → false", starter_code: "function isPalindrome(str) {\n  // your code here\n}", expected_concepts: ["reverse", "toLowerCase", "replace"], xp_reward: 75 },
  { title: "Count Vowels", difficulty: "Easy", prompt: "Count the number of vowels (a,e,i,o,u) in a string. Case insensitive.\n\nExample:\nInput: 'Hello World' → 3\nInput: 'JavaScript' → 3", starter_code: "function countVowels(str) {\n  // your code here\n}", expected_concepts: ["match", "filter", "regex"], xp_reward: 75 },
  { title: "Two Sum Problem", difficulty: "Medium", prompt: "Given an array and a target, return indices of two numbers that add to target.\n\nExample:\nInput: [2,7,11,15], target=9 → [0,1]\nInput: [3,2,4], target=6 → [1,2]", starter_code: "function twoSum(nums, target) {\n  // your code here\n}", expected_concepts: ["map", "hash", "object"], xp_reward: 75 },
  { title: "Anagram Checker", difficulty: "Medium", prompt: "Check if two strings are anagrams. Ignore spaces and case.\n\nExample:\nInput: 'listen', 'silent' → true\nInput: 'hello', 'world' → false", starter_code: "function isAnagram(str1, str2) {\n  // your code here\n}", expected_concepts: ["sort", "split", "join"], xp_reward: 75 },
  { title: "Flatten Nested Array", difficulty: "Medium", prompt: "Flatten a nested array to a single level without Array.flat().\n\nExample:\nInput: [1,[2,[3,[4]],5]] → [1,2,3,4,5]\nInput: [[1,2],[3,[4,5]]] → [1,2,3,4,5]", starter_code: "function flattenArray(arr) {\n  // your code here\n}", expected_concepts: ["recursion", "concat", "reduce"], xp_reward: 75 },
  { title: "Fibonacci Sequence", difficulty: "Medium", prompt: "Return the nth Fibonacci number. Sequence: 0,1,1,2,3,5,8...\n\nExample:\nInput: 6 → 8\nInput: 10 → 55", starter_code: "function fibonacci(n) {\n  // your code here\n}", expected_concepts: ["recursion", "loop", "memoization"], xp_reward: 75 },
  { title: "Remove Duplicates", difficulty: "Easy", prompt: "Remove all duplicate values from an array.\n\nExample:\nInput: [1,2,2,3,4,4,5] → [1,2,3,4,5]\nInput: ['a','b','a','c'] → ['a','b','c']", starter_code: "function removeDuplicates(arr) {\n  // your code here\n}", expected_concepts: ["set", "filter", "includes"], xp_reward: 75 },
  { title: "Chunk Array", difficulty: "Medium", prompt: "Split an array into chunks of a given size.\n\nExample:\nInput: [1,2,3,4,5], size=2 → [[1,2],[3,4],[5]]\nInput: [1,2,3,4,5,6], size=3 → [[1,2,3],[4,5,6]]", starter_code: "function chunkArray(arr, size) {\n  // your code here\n}", expected_concepts: ["slice", "push", "loop"], xp_reward: 75 },
  { title: "Capitalize Words", difficulty: "Easy", prompt: "Capitalize the first letter of every word in a sentence.\n\nExample:\nInput: 'hello world' → 'Hello World'\nInput: 'javascript is awesome' → 'Javascript Is Awesome'", starter_code: "function capitalizeWords(str) {\n  // your code here\n}", expected_concepts: ["split", "map", "join", "toUpperCase"], xp_reward: 75 },
  { title: "Longest Word Finder", difficulty: "Easy", prompt: "Find the longest word in a sentence. Return the first if tied.\n\nExample:\nInput: 'The quick brown fox' → 'quick'\nInput: 'I love JavaScript programming' → 'programming'", starter_code: "function longestWord(sentence) {\n  // your code here\n}", expected_concepts: ["split", "reduce", "length"], xp_reward: 75 },
  { title: "Sum Nested Numbers", difficulty: "Hard", prompt: "Recursively sum all numbers in a deeply nested array.\n\nExample:\nInput: [1,[2,[3,[4]]]] → 10\nInput: [1,[2,3],[4,[5,6]]] → 21", starter_code: "function sumNested(arr) {\n  // your code here\n}", expected_concepts: ["recursion", "reduce", "isArray"], xp_reward: 75 },
  { title: "Binary Search", difficulty: "Hard", prompt: "Implement binary search on a sorted array. Return the index or -1 if not found.\n\nExample:\nInput: [1,3,5,7,9,11], target=7 → 3\nInput: [1,3,5,7,9], target=6 → -1", starter_code: "function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  your code here\n}", expected_concepts: ["while", "mid", "left", "right"], xp_reward: 75 },
  { title: "Find the Unique", difficulty: "Medium", prompt: "Every number appears twice except one. Find the unique number.\n\nExample:\nInput: [2,3,5,3,2] → 5\nInput: [7,1,7] → 1", starter_code: "function findUnique(nums) {\n  // your code here\n}", expected_concepts: ["xor", "set", "filter"], xp_reward: 75 },
];

const WEEKLY_POOL = [
  { title: "Implement Debounce", difficulty: "Hard", prompt: "Implement a debounce function that delays invoking a function until after wait ms since the last call.\n\nExample:\nconst debounced = debounce(fn, 300);\n// fn only fires 300ms after last call\n\nThis is a core frontend interview concept.", starter_code: "function debounce(fn, delay) {\n  // your code here\n}", expected_concepts: ["setTimeout", "clearTimeout", "closure"], xp_reward: 150 },
  { title: "Deep Object Clone", difficulty: "Hard", prompt: "Deep clone a JS object without JSON.parse/stringify. Handle nested objects and arrays.\n\nExample:\nInput: { a: 1, b: { c: 2, d: [3,4] } }\nModifying the clone must NOT affect the original.", starter_code: "function deepClone(obj) {\n  // your code here\n}", expected_concepts: ["recursion", "isArray", "typeof"], xp_reward: 150 },
  { title: "Event Emitter Class", difficulty: "Hard", prompt: "Implement EventEmitter with on(), off(), emit().\n\nExample:\nconst e = new EventEmitter();\ne.on('click', handler);\ne.emit('click', 'data'); // fires handler\ne.off('click', handler);\n\nMultiple listeners should all fire.", starter_code: "class EventEmitter {\n  constructor() {}\n  on(event, listener) {}\n  off(event, listener) {}\n  emit(event, ...args) {}\n}", expected_concepts: ["class", "map", "filter", "listeners"], xp_reward: 150 },
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

    console.warn("Pool insert has failed by using Groq fallback:", err.message);
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Respond with valid JSON only. No markdown." },
        { role: "user", content: 'Generate a Medium JS challenge as JSON: {"title":"...","difficulty":"Medium","prompt":"...with 2 examples","starter_code":"function solution(){}","expected_concepts":["a","b"],"xp_reward":75}' },
      ],
      temperature: 0.9, max_tokens: 500,
    });
    const raw = completion.choices[0]?.message?.content || "{}";
    const challenge = JSON.parse(raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim());
    return await DailyChallenge.bulkCreate([
      { ...challenge, date, is_weekly: false },
      { ...WEEKLY_POOL[0], date, is_weekly: true },
    ]);
  }
}

router.get("/daily", async (req, res) => {
  try {
    return res.json(await getOrCreateToday());
  } catch (err) {
    console.error("Daily route error:", err?.message || err);
    return res.status(500).json({ error: "Failed to load daily challenge." });
  }
});

router.post("/daily/seed", async (req, res) => {
  try {
    await DailyChallenge.destroy({ where: { date: today() } });
    return res.json({ message: "Seeded!", challenges: await getOrCreateToday() });
  } catch (err) {
    return res.status(500).json({ error: "Seed failed." });
  }
});

module.exports = router;
