## 26ENSQ7: Problem Statement 7
# 🎮**SkillQuest — Gamified Learning Platform for Tech Skills**
**The Vision**: Build an immersive gamified learning platform where developers level up
their technical skills through structured learning paths, daily challenges, XP points,
leaderboards, and AI-powered personalised missions — making learning feel like a game.

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Framer Motion for animations
- TanStack Query for fetching the data
- React Router DOM
- Lucide React
- Sonner
- ReactMarkdown

**Backend**
- Node.js + Express
- Sequelize ORM
- PostgreSQL

**Third-party / APIs**
- Groq Api — faster,free and powers the AI Tutor and AI Mission generation
- YouTube Embed — video lessons inside each level

---

## Features Built

**Core Learning**

        ● 6 skill tracks: Web Development, DSA & Algorithms,   System Design, Databases, DevOps, APIs & Integrations
        ● Each level has a video lesson, reading material (markdown), a 3-question quiz, and a coding challenge
        ● XP awarded at every step — watching, quizzing, completing challenges

**Gamification**

        ● XP Points: earn XP for completing lessons (+10), quizzes (+20), coding challenges
        (+50), daily logins (+5)
        ● Levels: Rookie → Developer → Senior Dev → Architect → Legend (each requiring more
        XP)
        ● Badges: First Lesson, 7-Day Streak, Quiz Master, Speed Coder, Full Stack Explorer,
        100 Problems Solved
        ● Streak system: daily activity streak with freeze option (2 freezes/month)
        ● Global leaderboard: top 100 users by XP this week and all-time    

**AI Features**

        ● AI Tutor — ask anything, get explanations, simplifications or harder problems
        ● AI Missions — personalised weekly quests tailored to your skill gaps **for pro user only**
        ● AI Mock Tests — 5 auto-generated questions per track with instant grading  **for pro user only**

**Social**

         ● Global leaderboard (top 100)
         ● Activity feed — see what others are solving, levelling up, earning badges

**Pro Plan**

         ● Free plan: 2 tracks, 10 AI tutor messages per day
         ● Pro plan: all 6 tracks, unlimited AI tutor, AI Missions, Mock Tests

**Profile**

        ● display name and bio can be edited
        ● XP progress bar, stats overview present
        ● Badge showcase
        ● Activity heatmap (for last 12 weeks)
        ● Account deletion

---

## Running Locally

Need a Node.js and PostgreSQL installed before starting.

**1. Clone the repo**
```bash
git clone https://github.com/Sheefhuss/SkillQuest.git
cd SkillQuest
```

**2. Set up the backend**
```bash
cd Backend
npm install
```

Create a `.env` file in the Backend folder:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillquest
DB_USER=your_postgres_username
DB_PASS=your_postgres_password
JWT_SECRET=any_random_secret_string
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

Create the database in PostgreSQL:
```bash
psql -U postgres -c "CREATE DATABASE skillquest;"
```

Seed the database with tracks and levels:
```bash
node seeders/seed.js
```

Start the backend:
```bash
npm run dev
# or: node index.js
```

**3. Set up the frontend**
```bash
cd ../Frontend
npm install
```

Create a `.env` file in the Frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

**4. Open the app**

Go to `http://localhost:5173` in your browser. Register an account and you're good to go.

---

## Live Demo

<u> https://skillquest2026.netlify.app <u>

---
** ##  Team **

Mahiya Haider : designing the UI, building components and making sure the experience felt clean and attractive.
Sheefa Hussain : backend architecture, database design, API integration, deployment, testing and maintainance.

---

## Known Bugs & Limitations

We're on the free tier :
         ● the server spins down after inactivity.( refresh requires sometime for update ).
         ● Can't handle millions user at once (load balancing not fully developed)
---
