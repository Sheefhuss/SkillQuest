const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = require('../config/database');
const DailyChallenge = require('../models/DailyChallenge');

const challenges = [
  {
    title: "Reverse a String",
    difficulty: "Easy",
    prompt: "Write a function that reverses a string without using the built-in .reverse() method.\n\nExample:\nInput: 'hello'\nOutput: 'olleh'\n\nInput: 'SkillQuest'\nOutput: 'tseuQllikS'",
    starter_code: "function reverseString(str) {\n  // your code here\n}",
    expected_concepts: ["split", "join", "loop", "for"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "FizzBuzz Classic",
    difficulty: "Easy",
    prompt: "Write a function that returns an array of numbers from 1 to n. For multiples of 3 return 'Fizz', for multiples of 5 return 'Buzz', for multiples of both return 'FizzBuzz'.\n\nExample:\nInput: n = 15\nOutput: [1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz']",
    starter_code: "function fizzBuzz(n) {\n  // your code here\n}",
    expected_concepts: ["modulo", "loop", "push", "array"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Find the Duplicate",
    difficulty: "Medium",
    prompt: "Given an array of integers where every number appears twice except for one, find the number that appears only once.\n\nExample:\nInput: [2, 3, 5, 3, 2]\nOutput: 5\n\nInput: [7, 1, 7]\nOutput: 1",
    starter_code: "function findDuplicate(nums) {\n  // your code here\n}",
    expected_concepts: ["xor", "set", "map", "filter"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Palindrome Check",
    difficulty: "Easy",
    prompt: "Write a function that checks if a given string is a palindrome. Ignore spaces and case.\n\nExample:\nInput: 'racecar'\nOutput: true\n\nInput: 'A man a plan a canal Panama'\nOutput: true\n\nInput: 'hello'\nOutput: false",
    starter_code: "function isPalindrome(str) {\n  // your code here\n}",
    expected_concepts: ["reverse", "toLowerCase", "replace", "split"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Count Vowels",
    difficulty: "Easy",
    prompt: "Write a function that counts the number of vowels (a, e, i, o, u) in a string. Case insensitive.\n\nExample:\nInput: 'Hello World'\nOutput: 3\n\nInput: 'JavaScript'\nOutput: 3",
    starter_code: "function countVowels(str) {\n  // your code here\n}",
    expected_concepts: ["match", "filter", "regex", "toLowerCase"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Flatten Nested Array",
    difficulty: "Medium",
    prompt: "Write a function that flattens a nested array to a single level without using Array.flat().\n\nExample:\nInput: [1, [2, [3, [4]], 5]]\nOutput: [1, 2, 3, 4, 5]\n\nInput: [[1, 2], [3, [4, 5]]]\nOutput: [1, 2, 3, 4, 5]",
    starter_code: "function flattenArray(arr) {\n  // your code here\n}",
    expected_concepts: ["recursion", "concat", "reduce", "isArray"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Two Sum Problem",
    difficulty: "Medium",
    prompt: "Given an array of numbers and a target sum, return the indices of the two numbers that add up to the target. Each input has exactly one solution.\n\nExample:\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\n\nInput: nums = [3, 2, 4], target = 6\nOutput: [1, 2]",
    starter_code: "function twoSum(nums, target) {\n  // your code here\n}",
    expected_concepts: ["map", "hash", "object", "indexOf"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Anagram Checker",
    difficulty: "Medium",
    prompt: "Write a function that checks if two strings are anagrams of each other. Ignore spaces and case.\n\nExample:\nInput: 'listen', 'silent'\nOutput: true\n\nInput: 'hello', 'world'\nOutput: false",
    starter_code: "function isAnagram(str1, str2) {\n  // your code here\n}",
    expected_concepts: ["sort", "split", "join", "toLowerCase"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Fibonacci Sequence",
    difficulty: "Medium",
    prompt: "Write a function that returns the nth Fibonacci number. The sequence starts: 0, 1, 1, 2, 3, 5, 8...\n\nExample:\nInput: n = 6\nOutput: 8\n\nInput: n = 10\nOutput: 55",
    starter_code: "function fibonacci(n) {\n  // your code here\n}",
    expected_concepts: ["recursion", "loop", "memoization", "dynamic"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Longest Word Finder",
    difficulty: "Easy",
    prompt: "Write a function that finds the longest word in a sentence. If there are ties, return the first one.\n\nExample:\nInput: 'The quick brown fox'\nOutput: 'quick'\n\nInput: 'I love JavaScript programming'\nOutput: 'programming'",
    starter_code: "function longestWord(sentence) {\n  // your code here\n}",
    expected_concepts: ["split", "reduce", "sort", "length"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Chunk Array",
    difficulty: "Medium",
    prompt: "Write a function that splits an array into chunks of a given size.\n\nExample:\nInput: [1, 2, 3, 4, 5], size = 2\nOutput: [[1, 2], [3, 4], [5]]\n\nInput: [1, 2, 3, 4, 5, 6], size = 3\nOutput: [[1, 2, 3], [4, 5, 6]]",
    starter_code: "function chunkArray(arr, size) {\n  // your code here\n}",
    expected_concepts: ["slice", "push", "loop", "ceil"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Capitalize Words",
    difficulty: "Easy",
    prompt: "Write a function that capitalizes the first letter of every word in a sentence.\n\nExample:\nInput: 'hello world from skillquest'\nOutput: 'Hello World From Skillquest'\n\nInput: 'javascript is awesome'\nOutput: 'Javascript Is Awesome'",
    starter_code: "function capitalizeWords(str) {\n  // your code here\n}",
    expected_concepts: ["split", "map", "join", "toUpperCase"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Remove Duplicates",
    difficulty: "Easy",
    prompt: "Write a function that removes all duplicate values from an array and returns a new array with unique values only.\n\nExample:\nInput: [1, 2, 2, 3, 4, 4, 5]\nOutput: [1, 2, 3, 4, 5]\n\nInput: ['a', 'b', 'a', 'c']\nOutput: ['a', 'b', 'c']",
    starter_code: "function removeDuplicates(arr) {\n  // your code here\n}",
    expected_concepts: ["set", "filter", "indexOf", "includes"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Sum Nested Numbers",
    difficulty: "Hard",
    prompt: "Write a function that recursively sums all numbers in a deeply nested array.\n\nExample:\nInput: [1, [2, [3, [4]]]]\nOutput: 10\n\nInput: [1, [2, 3], [4, [5, 6]]]\nOutput: 21",
    starter_code: "function sumNested(arr) {\n  // your code here\n}",
    expected_concepts: ["recursion", "reduce", "isArray", "typeof"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Binary Search",
    difficulty: "Hard",
    prompt: "Implement binary search on a sorted array. Return the index of the target or -1 if not found.\n\nExample:\nInput: arr = [1, 3, 5, 7, 9, 11], target = 7\nOutput: 3\n\nInput: arr = [1, 3, 5, 7, 9], target = 6\nOutput: -1",
    starter_code: "function binarySearch(arr, target) {\n  // your code here\n}",
    expected_concepts: ["while", "mid", "left", "right"],
    xp_reward: 75,
    is_weekly: false,
  },
  {
    title: "Implement Debounce",
    difficulty: "Hard",
    prompt: "Implement a debounce function that delays invoking a function until after a specified wait time has elapsed since the last call.\n\nExample:\nconst debounced = debounce(fn, 300);\ndebounced() // called multiple times\n// fn only fires 300ms after the last call\n\nThis is a common interview question used in real frontend work.",
    starter_code: "function debounce(fn, delay) {\n  // your code here\n}",
    expected_concepts: ["setTimeout", "clearTimeout", "closure", "timer"],
    xp_reward: 150,
    is_weekly: true,
  },
  {
    title: "Deep Object Clone",
    difficulty: "Hard",
    prompt: "Write a function that deep clones a JavaScript object without using JSON.parse/JSON.stringify. Handle nested objects and arrays.\n\nExample:\nInput: { a: 1, b: { c: 2, d: [3, 4] } }\nOutput: A new object with same structure but no shared references\n\nModifying the clone should NOT affect the original.",
    starter_code: "function deepClone(obj) {\n  // your code here\n}",
    expected_concepts: ["recursion", "isArray", "typeof", "object"],
    xp_reward: 150,
    is_weekly: true,
  },
  {
    title: "Event Emitter Class",
    difficulty: "Hard",
    prompt: "Implement a simple EventEmitter class with on(), off(), and emit() methods.\n\nExample:\nconst emitter = new EventEmitter();\nemitter.on('click', (data) => console.log(data));\nemitter.emit('click', 'button pressed'); // logs 'button pressed'\nemitter.off('click', handler);\n\nMultiple listeners for the same event should all fire.",
    starter_code: "class EventEmitter {\n  constructor() {\n    // your code here\n  }\n  on(event, listener) {}\n  off(event, listener) {}\n  emit(event, ...args) {}\n}",
    expected_concepts: ["class", "map", "filter", "listeners"],
    xp_reward: 150,
    is_weekly: true,
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Success... Connected to database.");
    const today = new Date();
    let dailyIndex = 0;
    let weeklyIndex = 0;

    const dailyChallenges = challenges.filter(c => !c.is_weekly);
    const weeklyChallenges = challenges.filter(c => c.is_weekly);

    const toInsert = [];

    for (let i = 0; i < dailyChallenges.length; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const existing = await DailyChallenge.findOne({ where: { date: dateStr, is_weekly: false } });
      if (!existing) {
        toInsert.push({ ...dailyChallenges[i], date: dateStr });
      } else {
        console.log(` Skipping daily for ${dateStr} (already exists)`);
      }
    }

    for (let i = 0; i < weeklyChallenges.length; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i * 7);
      const dateStr = date.toISOString().split("T")[0];

      const existing = await DailyChallenge.findOne({ where: { date: dateStr, is_weekly: true } });
      if (!existing) {
        toInsert.push({ ...weeklyChallenges[i], date: dateStr });
      } else {
        console.log(`⏭ Skipping weekly for ${dateStr} (already exists)`);
      }
    }

    if (toInsert.length > 0) {
      await DailyChallenge.bulkCreate(toInsert);
      console.log(`Seeded ${toInsert.length} challenges.`);
    } else {
      console.log("All challenges already seeded.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Seeder failed:", err.message);
    process.exit(1);
  }
}

seed();
