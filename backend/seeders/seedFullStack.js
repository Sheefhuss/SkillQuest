const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = require('../config/database');
const Track = require('../models/Track');
const Level = require('../models/Level');

const levels = [
  {
    track_slug: 'full-stack-web',
    order: 1,
    tier: 'Beginner',
    title: 'HTML, CSS & the Web',
    summary: 'Understand how the browser renders, semantic HTML, and core CSS.',
    video_url: 'https://www.youtube.com/embed/qz0aGYrrlhU',
    reading_material: `# HTML, CSS & the Web\n\nThe browser parses HTML into a DOM tree, applies CSS rules, and paints pixels. Understanding this pipeline is the foundation of everything frontend.\n\n## Key concepts\n- Semantic HTML (header, main, article, section)\n- The box model: margin, border, padding, content\n- Flexbox for 1D layouts, Grid for 2D\n- Specificity and the cascade\n\n## Why it matters\nEvery React component ultimately compiles to HTML and CSS. Knowing the fundamentals means you can debug layout issues without guessing.`,
    quiz: [
      { q: 'Which HTML element is most appropriate for the main navigation of a page?', options: ['<div>', '<nav>', '<section>', '<header>'], correct_index: 1 },
      { q: 'What does the CSS box model consist of?', options: ['margin, border, padding, content', 'width, height, color, font', 'display, position, float, clear', 'flex, grid, block, inline'], correct_index: 0 },
      { q: 'Flexbox is best suited for:', options: ['2D grid layouts', '1D row or column layouts', 'Animations', 'Typography'], correct_index: 1 },
    ],
    challenge_prompt: 'Build a responsive nav bar with a logo on the left and links on the right using only HTML and CSS Flexbox. No frameworks.',
    challenge_starter: '<!-- your HTML here -->\n<nav>\n\n</nav>\n\n<style>\n  /* your CSS here */\n</style>',
    xp_reward: 80,
  },
  {
    track_slug: 'full-stack-web',
    order: 2,
    tier: 'Beginner',
    title: 'JavaScript Fundamentals',
    summary: 'Variables, functions, arrays, objects, and async JS.',
    video_url: 'https://www.youtube.com/embed/W6NZfCO5SIk',
    reading_material: `# JavaScript Fundamentals\n\nJS is the only language that runs natively in the browser. Before touching React or Node, you need a solid grip on the core language.\n\n## Key concepts\n- var vs let vs const — always use const by default\n- Arrow functions and lexical this\n- Array methods: map, filter, reduce, find\n- Destructuring and spread syntax\n- Promises and async/await\n- The event loop (why setTimeout(fn, 0) is not instant)\n\n## Common mistakes\n- Mutating state directly instead of returning new values\n- Forgetting that async functions always return a Promise\n- Confusing == and ===`,
    quiz: [
      { q: 'What does [1,2,3].map(x => x * 2) return?', options: ['[2,4,6]', '[1,2,3]', '6', 'undefined'], correct_index: 0 },
      { q: 'Which keyword should you use by default for variable declarations?', options: ['var', 'let', 'const', 'any'], correct_index: 2 },
      { q: 'async functions always return:', options: ['undefined', 'a string', 'a Promise', 'an array'], correct_index: 2 },
    ],
    challenge_prompt: 'Write a function `groupBy(arr, key)` that groups an array of objects by a given key.\n\nExample:\ngroupBy([{type:"a",val:1},{type:"b",val:2},{type:"a",val:3}], "type")\n// → { a: [{type:"a",val:1},{type:"a",val:3}], b: [{type:"b",val:2}] }',
    challenge_starter: 'function groupBy(arr, key) {\n  \n}',
    xp_reward: 80,
  },
  {
    track_slug: 'full-stack-web',
    order: 3,
    tier: 'Intermediate',
    title: 'React & Component Thinking',
    summary: 'Build UIs with components, props, state, and hooks.',
    video_url: 'https://www.youtube.com/embed/bMknfKXIFA8',
    reading_material: `# React & Component Thinking\n\nReact is a view library. It re-renders components when state changes. That's the whole mental model.\n\n## Key concepts\n- JSX compiles to React.createElement calls\n- Props flow down, events bubble up\n- useState for local state, useEffect for side effects\n- useRef to hold mutable values without re-rendering\n- Keys in lists tell React what changed\n\n## Common mistakes\n- Putting everything in one giant component\n- Calling hooks inside conditions or loops\n- Using index as key in dynamic lists\n- Not cleaning up effects (memory leaks)\n\n## Component design rule\nIf a component does more than one thing, split it.`,
    quiz: [
      { q: 'What triggers a React component to re-render?', options: ['A CSS change', 'A state or prop change', 'A console.log', 'A comment change'], correct_index: 1 },
      { q: 'Where should you NOT call a hook?', options: ['At the top of a component', 'Inside an if statement', 'In a custom hook', 'In a functional component'], correct_index: 1 },
      { q: 'Which hook runs code after a component renders?', options: ['useState', 'useRef', 'useEffect', 'useContext'], correct_index: 2 },
    ],
    challenge_prompt: 'Build a reusable `<Tabs>` component that accepts a `tabs` array of `{ label, content }` objects and renders clickable tab headers with the active tab\'s content shown below.',
    challenge_starter: 'function Tabs({ tabs }) {\n  \n}',
    xp_reward: 120,
  },
  {
    track_slug: 'full-stack-web',
    order: 4,
    tier: 'Intermediate',
    title: 'Node.js & Express APIs',
    summary: 'Build REST APIs, handle auth, and connect to a database.',
    video_url: 'https://www.youtube.com/embed/Oe421EPjeBE',
    reading_material: `# Node.js & Express APIs\n\nNode lets you run JS on the server. Express is a minimal framework for routing HTTP requests.\n\n## Key concepts\n- Request/response cycle: method, path, headers, body, status code\n- Middleware: functions that run before your route handler\n- REST conventions: GET to read, POST to create, PATCH to update, DELETE to remove\n- JWT authentication: sign a token on login, verify it on protected routes\n- Error handling middleware: (err, req, res, next)\n\n## Project structure that scales\n\`\`\`\nroutes/\n  auth.js\n  users.js\nmodels/\n  User.js\nmiddleware/\n  auth.js\nserver.js\n\`\`\``,
    quiz: [
      { q: 'Which HTTP method should you use to partially update a resource?', options: ['GET', 'POST', 'PATCH', 'PUT'], correct_index: 2 },
      { q: 'Express middleware functions receive:', options: ['req and res only', 'req, res, and next', 'just next', 'event and callback'], correct_index: 1 },
      { q: 'A 401 status code means:', options: ['Not found', 'Server error', 'Unauthorized', 'Forbidden'], correct_index: 2 },
    ],
    challenge_prompt: 'Build an Express route `GET /api/users/:id` that returns a user by ID from an in-memory array. Return 404 with a message if the user is not found.',
    challenge_starter: 'const express = require("express");\nconst router = express.Router();\n\nconst users = [\n  { id: 1, name: "Alice" },\n  { id: 2, name: "Bob" },\n];\n\nrouter.get("/:id", (req, res) => {\n  \n});\n\nmodule.exports = router;',
    xp_reward: 120,
  },
  {
    track_slug: 'full-stack-web',
    order: 5,
    tier: 'Advanced',
    title: 'Full Stack Integration',
    summary: 'Connect React frontend to an Express backend with auth, data fetching, and deployment.',
    video_url: 'https://www.youtube.com/embed/nu_pCVPKzTk',
    reading_material: `# Full Stack Integration\n\nBuilding the frontend and backend separately is easy. Making them work together reliably is the real skill.\n\n## Key concepts\n- CORS: why it exists and how to configure it properly\n- Environment variables: never hardcode API URLs or secrets\n- React Query for server state (caching, loading, error states)\n- JWT flow: login → store token → attach to every request → refresh on expiry\n- Deployment: frontend on Vercel/Netlify, backend on Railway/Render\n\n## Common integration bugs\n- Forgetting to send Authorization header\n- CORS blocking requests in production but not development\n- API base URL hardcoded to localhost\n- Not handling loading and error states in the UI\n\n## The rule\nYour frontend should never know how the backend stores data. It only talks to the API.`,
    quiz: [
      { q: 'Where should your API base URL be stored?', options: ['Hardcoded in each file', 'In an environment variable', 'In localStorage', 'In a comment'], correct_index: 1 },
      { q: 'CORS errors happen because:', options: ['Your code has a bug', 'The browser blocks cross-origin requests by default', 'Node.js is slow', 'React does not support fetch'], correct_index: 1 },
      { q: 'React Query\'s main benefit over plain useEffect for data fetching is:', options: ['It is faster', 'Built-in caching, deduplication, and background refetching', 'It works offline', 'It replaces useState'], correct_index: 1 },
    ],
    challenge_prompt: 'Wire up a React component that fetches a list of users from `GET /api/users`, shows a loading spinner while fetching, displays an error message on failure, and renders the user list on success. Use React Query.',
    challenge_starter: 'import { useQuery } from "@tanstack/react-query";\n\nexport default function UserList() {\n  \n}',
    xp_reward: 200,
  },
];

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  await Track.update(
    { icon: 'Code2', category: 'Full Stack' },
    { where: { slug: 'full-stack-web' } }
  );
  console.log('✅ Track updated: icon=Code2, category=Full Stack');

  let inserted = 0;
  for (const level of levels) {
    const exists = await Level.findOne({
      where: { track_slug: level.track_slug, order: level.order }
    });
    if (!exists) {
      await Level.create(level);
      inserted++;
    } else {
      console.log(`⏭  Skipping level ${level.order} (already exists)`);
    }
  }

  console.log(`✅ Seeded ${inserted} levels for full-stack-web`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
