const sequelize = require('../config/database');
const Track = require('../models/Track');
const Level = require('../models/Level');

const tracks = [
  { slug: 'web-development', title: 'Web Development', description: 'Master modern frontend & backend web stacks.', icon: 'Globe', accent_color: '#7c3aed', category: 'Frontend', is_free: true, order: 1 },
  { slug: 'dsa', title: 'DSA & Algorithms', description: 'Sharpen data structures and algorithmic thinking.', icon: 'Binary', accent_color: '#06b6d4', category: 'Computer Science', is_free: true, order: 2 },
  { slug: 'system-design', title: 'System Design', description: 'Design scalable, fault-tolerant systems like a senior engineer.', icon: 'Network', accent_color: '#f59e0b', category: 'Architecture', is_free: false, order: 3 },
  { slug: 'databases', title: 'Databases', description: 'Master SQL, NoSQL, indexing and query optimisation.', icon: 'Database', accent_color: '#10b981', category: 'Backend', is_free: false, order: 4 },
  { slug: 'devops', title: 'DevOps', description: 'CI/CD, Docker, Kubernetes and cloud deployments.', icon: 'Server', accent_color: '#ef4444', category: 'Infrastructure', is_free: false, order: 5 },
  { slug: 'apis', title: 'APIs & Integrations', description: 'REST, GraphQL, WebSockets and third-party integrations.', icon: 'Plug', accent_color: '#8b5cf6', category: 'Backend', is_free: false, order: 6 },
];

const levels = [
  {
    track_slug: 'web-development', order: 1, tier: 'Beginner',
    title: 'HTML, CSS & the Web',
    summary: 'Understand how the browser renders, semantic HTML, and core CSS.',
    video_url: 'https://www.youtube.com/embed/qz0aGYrrlhU',
    reading_material: '## HTML & CSS Fundamentals\n\n### What is HTML?\nHTML is the skeleton of every web page.\n\n### The Box Model\nEvery element is a box: content → padding → border → margin\n\n### Flexbox\n```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n```',
    quiz: [
      { q: 'Which tag defines the main navigation?', options: ['<nav>', '<menu>', '<ul>', '<header>'], correct_index: 0 },
      { q: 'What does the CSS box model include?', options: ['content, padding, border, margin', 'width, height, color', 'font, size, weight', 'flex, grid, block'], correct_index: 0 },
      { q: 'Which CSS property lays out children side by side?', options: ['display: flex', 'display: inline', 'float: left', 'position: absolute'], correct_index: 0 },
    ],
    challenge_prompt: 'Build a profile card using HTML & CSS with a name, role, avatar placeholder, and a button.',
    challenge_starter: '<!DOCTYPE html>\n<html>\n<head><style>/* styles */</style></head>\n<body><!-- card --></body>\n</html>',
    xp_reward: 80,
  },
  {
    track_slug: 'web-development', order: 2, tier: 'Beginner',
    title: 'JavaScript Essentials',
    summary: 'Variables, functions, DOM manipulation and events.',
    video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
    reading_material: '## JavaScript Essentials\n\n### Variables\n```js\nconst name = "Alice";\nlet score = 0;\n```\n\n### Arrow Functions\n```js\nconst greet = (name) => `Hello, ${name}!`;\n```\n\n### Arrays\n```js\nconst doubled = [1,2,3].map(n => n * 2);\n```',
    quiz: [
      { q: "Difference between 'let' and 'const'?", options: ['const cannot be reassigned', 'let is faster', 'const is global', 'No difference'], correct_index: 0 },
      { q: 'Which method adds an event listener?', options: ['addEventListener', 'onClick', 'attachEvent', 'bindEvent'], correct_index: 0 },
      { q: 'What does Array.map() return?', options: ['A new array', 'The original array', 'undefined', 'A number'], correct_index: 0 },
    ],
    challenge_prompt: 'Write a JS function that takes an array of numbers and returns only the even ones, doubled.',
    challenge_starter: 'function evenDoubled(arr) {\n  // your code\n}\nconsole.log(evenDoubled([1,2,3,4,5])); // [4, 8]',
    xp_reward: 80,
  },
  {
    track_slug: 'web-development', order: 3, tier: 'Intermediate',
    title: 'JavaScript Deep Dive',
    summary: 'Closures, async/await, the event loop, modules.',
    video_url: 'https://www.youtube.com/embed/Bv_5Zv5c-Ts',
    reading_material: '## JavaScript Deep Dive\n\n### Closures\n```js\nfunction counter() {\n  let count = 0;\n  return () => ++count;\n}\n```\n\n### async/await\n```js\nasync function fetchUser(id) {\n  const res = await fetch(`/api/users/${id}`);\n  return await res.json();\n}\n```',
    quiz: [
      { q: 'What is a closure?', options: ['A function retaining access to its outer scope', 'A loop', 'An object method', 'A CSS rule'], correct_index: 0 },
      { q: 'What keyword makes a function return a Promise?', options: ['async', 'await', 'promise', 'then'], correct_index: 0 },
      { q: 'What is the event loop responsible for?', options: ['Managing async task execution', 'Rendering DOM', 'Compiling JS', 'Handling CSS'], correct_index: 0 },
    ],
    challenge_prompt: 'Write an async function that fetches https://jsonplaceholder.typicode.com/todos/1 and logs the title.',
    challenge_starter: 'async function getTodo() {\n  // fetch and log the title\n}\ngetTodo();',
    xp_reward: 120,
  },
  {
    track_slug: 'web-development', order: 4, tier: 'Intermediate',
    title: 'React Fundamentals',
    summary: 'Components, props, state, hooks and JSX.',
    video_url: 'https://www.youtube.com/embed/bMknfKXIFA8',
    reading_material: '## React Fundamentals\n\n### Components\n```jsx\nfunction Button({ label, onClick }) {\n  return <button onClick={onClick}>{label}</button>;\n}\n```\n\n### useState\n```jsx\nconst [count, setCount] = useState(0);\n```',
    quiz: [
      { q: 'What hook manages local state in React?', options: ['useState', 'useEffect', 'useRef', 'useContext'], correct_index: 0 },
      { q: 'What is JSX?', options: ['A syntax extension that looks like HTML in JS', 'A new language', 'A CSS framework', 'A database query language'], correct_index: 0 },
      { q: 'When does useEffect run by default?', options: ['After every render', 'Only once', 'Before render', 'On click only'], correct_index: 0 },
    ],
    challenge_prompt: 'Build a counter component with increment, decrement, and reset buttons using useState.',
    challenge_starter: 'import { useState } from "react";\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <div>{count}</div>;\n}',
    xp_reward: 120,
  },
  {
    track_slug: 'web-development', order: 5, tier: 'Advanced',
    title: 'Full Stack with Node.js',
    summary: 'Build REST APIs with Express, connect to a database, deploy.',
    video_url: 'https://www.youtube.com/embed/Oe421EPjeBE',
    reading_material: '## Full Stack with Node.js\n\n### Express Setup\n```js\nconst express = require("express");\nconst app = express();\napp.use(express.json());\napp.get("/api/users", async (req, res) => {\n  res.json(await User.findAll());\n});\napp.listen(3000);\n```',
    quiz: [
      { q: 'Which HTTP method creates a resource?', options: ['POST', 'GET', 'PUT', 'DELETE'], correct_index: 0 },
      { q: 'What does res.json() do in Express?', options: ['Sends a JSON response', 'Parses incoming JSON', 'Connects to DB', 'Logs to console'], correct_index: 0 },
      { q: 'Purpose of environment variables?', options: ['Store secrets outside source code', 'Speed up server', 'Minify JS', 'Handle routing'], correct_index: 0 },
    ],
    challenge_prompt: 'Write an Express route GET /api/ping that returns { status: "ok", timestamp: Date.now() }.',
    challenge_starter: 'const express = require("express");\nconst app = express();\n// Add your route here\napp.listen(3000);',
    xp_reward: 150,
  },

  {
    track_slug: 'dsa', order: 1, tier: 'Beginner',
    title: 'Arrays & Strings',
    summary: 'Core operations, sliding window, two pointers.',
    video_url: 'https://www.youtube.com/embed/B31LgI4Y4DQ',
    reading_material: '## Arrays & Strings\n\n### Big-O\n- Access: O(1)\n- Search: O(n)\n\n### Two Pointer\n```js\nfunction twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const c = target - nums[i];\n    if (map[c] !== undefined) return [map[c], i];\n    map[nums[i]] = i;\n  }\n}\n```',
    quiz: [
      { q: 'Time complexity of accessing an array element by index?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct_index: 0 },
      { q: 'Best pattern for finding a pair summing to target?', options: ['Hash map', 'Recursion', 'Binary search', 'Stack'], correct_index: 0 },
      { q: 'Sliding window is most useful for:', options: ['Contiguous subarray problems', 'Tree traversal', 'Graph shortest path', 'Sorting'], correct_index: 0 },
    ],
    challenge_prompt: 'Given an array of integers, return the indices of the two numbers that add up to a target.',
    challenge_starter: 'function twoSum(nums, target) {\n  // your solution\n}\nconsole.log(twoSum([2,7,11,15], 9)); // [0,1]',
    xp_reward: 80,
  },
  {
    track_slug: 'dsa', order: 2, tier: 'Beginner',
    title: 'Linked Lists',
    summary: 'Singly & doubly linked lists, fast/slow pointers.',
    video_url: 'https://www.youtube.com/embed/F8AbOfQwl1c',
    reading_material: '## Linked Lists\n\n### Node Structure\n```js\nclass Node {\n  constructor(val) { this.val = val; this.next = null; }\n}\n```\n\n### Fast & Slow Pointers\n```js\nlet slow = head, fast = head;\nwhile (fast && fast.next) {\n  slow = slow.next;\n  fast = fast.next.next;\n}\n```',
    quiz: [
      { q: 'Time complexity of inserting at the head?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct_index: 0 },
      { q: "Floyd's cycle detection uses:", options: ['Two pointers at different speeds', 'A hash set', 'Recursion', 'Sorting'], correct_index: 0 },
      { q: 'How to find the middle of a linked list efficiently?', options: ['Fast and slow pointer', 'Count then traverse half', 'Binary search', 'Stack'], correct_index: 0 },
    ],
    challenge_prompt: 'Write a function to reverse a singly linked list in-place.',
    challenge_starter: 'function reverseList(head) {\n  // your solution\n}',
    xp_reward: 80,
  },
  {
    track_slug: 'dsa', order: 3, tier: 'Intermediate',
    title: 'Trees & Recursion',
    summary: 'Binary trees, DFS, BFS, recursion patterns.',
    video_url: 'https://www.youtube.com/embed/fAAZixBzIAI',
    reading_material: '## Trees & Recursion\n\n### DFS Inorder\n```js\nfunction inorder(node) {\n  if (!node) return;\n  inorder(node.left);\n  console.log(node.val);\n  inorder(node.right);\n}\n```\n\n### BFS\n```js\nfunction bfs(root) {\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node.left) queue.push(node.left);\n    if (node.right) queue.push(node.right);\n  }\n}\n```',
    quiz: [
      { q: 'Which traversal visits Left → Root → Right?', options: ['Inorder', 'Preorder', 'Postorder', 'BFS'], correct_index: 0 },
      { q: 'BFS uses which data structure?', options: ['Queue', 'Stack', 'Heap', 'Array'], correct_index: 0 },
      { q: 'Max nodes at depth d in a binary tree?', options: ['2^d', 'd²', '2d', 'd'], correct_index: 0 },
    ],
    challenge_prompt: 'Write a function to find the maximum depth of a binary tree.',
    challenge_starter: 'function maxDepth(root) {\n  // your solution\n}',
    xp_reward: 120,
  },
  {
    track_slug: 'dsa', order: 4, tier: 'Intermediate',
    title: 'Dynamic Programming',
    summary: 'Memoisation, tabulation, classic DP patterns.',
    video_url: 'https://www.youtube.com/embed/oBt53YbR9Kk',
    reading_material: '## Dynamic Programming\n\n### Memoisation\n```js\nconst memo = {};\nfunction fib(n) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  return memo[n] = fib(n-1) + fib(n-2);\n}\n```\n\n### Tabulation\n```js\nfunction climbStairs(n) {\n  const dp = [0,1,2];\n  for (let i = 3; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];\n  return dp[n];\n}\n```',
    quiz: [
      { q: 'Memoisation is a form of:', options: ['Top-down DP', 'Bottom-up DP', 'Greedy', 'Divide and conquer'], correct_index: 0 },
      { q: 'What does DP solve efficiently?', options: ['Overlapping subproblems', 'Sorting', 'Graph traversal', 'String formatting'], correct_index: 0 },
      { q: 'Time complexity of memoised Fibonacci:', options: ['O(n)', 'O(2^n)', 'O(n²)', 'O(log n)'], correct_index: 0 },
    ],
    challenge_prompt: 'Given n steps, you can climb 1 or 2 at a time. How many distinct ways to reach the top?',
    challenge_starter: 'function climbStairs(n) {\n  // your solution\n}\nconsole.log(climbStairs(5)); // 8',
    xp_reward: 120,
  },
  {
    track_slug: 'dsa', order: 5, tier: 'Advanced',
    title: 'Graphs & Pathfinding',
    summary: 'Adjacency lists, BFS/DFS on graphs, Dijkstra.',
    video_url: 'https://www.youtube.com/embed/tWVWeAqZ0WU',
    reading_material: '## Graphs\n\n### Adjacency List\n```js\nconst graph = { A: ["B","C"], B: ["A","D"] };\n```\n\n### DFS\n```js\nfunction dfs(graph, start, visited = new Set()) {\n  visited.add(start);\n  for (const n of graph[start]) {\n    if (!visited.has(n)) dfs(graph, n, visited);\n  }\n  return visited;\n}\n```',
    quiz: [
      { q: 'Best for shortest path in unweighted graph?', options: ['BFS', 'DFS', 'Dijkstra', 'Floyd-Warshall'], correct_index: 0 },
      { q: 'Adjacency list preferred when graph is:', options: ['Sparse', 'Dense', 'Weighted', 'Complete'], correct_index: 0 },
      { q: 'How to avoid infinite loops in graph traversal?', options: ['Track visited nodes', 'Limit recursion depth', 'Sort edges', 'Use stack only'], correct_index: 0 },
    ],
    challenge_prompt: 'Given a graph as adjacency list and two nodes, return shortest path length using BFS.',
    challenge_starter: 'function shortestPath(graph, start, end) {\n  // BFS solution\n}',
    xp_reward: 150,
  },

  {
    track_slug: 'system-design', order: 1, tier: 'Beginner',
    title: 'Scalability Basics',
    summary: 'Vertical vs horizontal scaling, load balancers, CDNs.',
    video_url: 'https://www.youtube.com/embed/sCQWCl_is8M',
    reading_material: '## Scalability Basics\n\n### Vertical vs Horizontal\n- Vertical: More RAM/CPU on one machine\n- Horizontal: More machines + load balancer\n\n### CDN\nCaches static assets at edge locations close to users.',
    quiz: [
      { q: 'Horizontal scaling means:', options: ['Adding more machines', 'Adding more RAM', 'Adding more CPU cores', 'Upgrading the OS'], correct_index: 0 },
      { q: 'A CDN improves:', options: ['Static asset delivery speed', 'Database queries', 'Auth speed', 'WebSocket connections'], correct_index: 0 },
      { q: 'Round Robin load balancing:', options: ['Distributes requests evenly in order', 'Sends all to fastest server', 'Caches responses', 'Encrypts traffic'], correct_index: 0 },
    ],
    challenge_prompt: 'Describe how you would design a URL shortener handling 10,000 requests/second.',
    challenge_starter: '// Design a URL shortener\n// Consider: hashing, storage, redirects, scaling',
    xp_reward: 100,
  },


  {
    track_slug: 'databases', order: 1, tier: 'Beginner',
    title: 'SQL Fundamentals',
    summary: 'SELECT, JOINs, indexes, transactions.',
    video_url: 'https://www.youtube.com/embed/HXV3zeQKqGY',
    reading_material: '## SQL Fundamentals\n\n### Core Queries\n```sql\nSELECT name, email FROM users WHERE active = true ORDER BY name LIMIT 10;\n```\n\n### JOINs\n```sql\nSELECT u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id;\n```',
    quiz: [
      { q: 'Which JOIN returns only matching rows?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'], correct_index: 0 },
      { q: 'What does an index do?', options: ['Speeds up reads', 'Speeds up writes', 'Encrypts data', 'Normalises data'], correct_index: 0 },
      { q: 'ACID stands for:', options: ['Atomicity, Consistency, Isolation, Durability', 'Accuracy, Completeness, Integrity, Data', 'Array, Cache, Index, Delete', 'None'], correct_index: 0 },
    ],
    challenge_prompt: 'Write a SQL query to find the top 5 users by total order value.',
    challenge_starter: '-- users(id, name)\n-- orders(id, user_id, total)\nSELECT -- your query',
    xp_reward: 100,
  },


  {
    track_slug: 'devops', order: 1, tier: 'Beginner',
    title: 'Docker Basics',
    summary: 'Containers, images, Dockerfile, docker-compose.',
    video_url: 'https://www.youtube.com/embed/pg19Z8LL06w',
    reading_material: '## Docker Basics\n\n### Dockerfile\n```dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "index.js"]\n```',
    quiz: [
      { q: 'Base file for building a Docker image?', options: ['Dockerfile', 'docker-compose.yml', 'package.json', '.env'], correct_index: 0 },
      { q: 'What does docker-compose do?', options: ['Runs multi-container apps', 'Builds a single image', 'Deploys to AWS', 'Monitors containers'], correct_index: 0 },
      { q: 'Containers differ from VMs because:', options: ['They share the host OS kernel', 'They are slower', 'They need more storage', 'They cannot run Linux'], correct_index: 0 },
    ],
    challenge_prompt: 'Write a Dockerfile for a Node.js Express app running on port 3000.',
    challenge_starter: '# Dockerfile\nFROM node:18-alpine\n# Complete the Dockerfile',
    xp_reward: 100,
  },

  {
    track_slug: 'apis', order: 1, tier: 'Beginner',
    title: 'REST API Design',
    summary: 'HTTP methods, status codes, versioning, auth patterns.',
    video_url: 'https://www.youtube.com/embed/lsMQRaeKNDk',
    reading_material: '## REST API Design\n\n### HTTP Methods\n- GET — Read\n- POST — Create\n- PATCH — Partial update\n- DELETE — Remove\n\n### Status Codes\n- 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error',
    quiz: [
      { q: 'Status code for successfully created resource?', options: ['201', '200', '204', '400'], correct_index: 0 },
      { q: 'Which HTTP method should be idempotent?', options: ['PUT', 'POST', 'PATCH', 'DELETE'], correct_index: 0 },
      { q: 'JWT stands for:', options: ['JSON Web Token', 'Java Web Transfer', 'JSON Web Transfer', 'Java Web Token'], correct_index: 0 },
    ],
    challenge_prompt: 'Design REST endpoints for a blog API with posts and comments.',
    challenge_starter: '// Blog API Routes\n// POST /api/posts\n// GET  /api/posts\n// Add all routes with descriptions',
    xp_reward: 100,
  },
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('----------DB connected---------');

    await sequelize.sync({ alter: true });
    console.log('--------Tables synced---------');

    for (const t of tracks) {
      await Track.upsert(t);
    }
    console.log(`Success ${tracks.length} tracks seeded`);

    await Level.destroy({ where: {} });
    for (const l of levels) {
      await Level.create(l);
    }
    console.log(`Success.. ${levels.length} levels seeded`);

    console.log('\nDone! All tracks and levels are ready.');
  } catch (error) {
    console.error(' Fail !! Seeding failed:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
};

seedDatabase();