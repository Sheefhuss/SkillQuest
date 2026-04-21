
export const LEVEL_TIERS = [
  { name: "Rookie", min: 0, color: "hsl(152 80% 55%)", icon: "Sparkles" },
  { name: "Developer", min: 500, color: "hsl(185 100% 55%)", icon: "Code2" },
  { name: "Senior Dev", min: 2000, color: "hsl(265 95% 66%)", icon: "Cpu" },
  { name: "Architect", min: 5000, color: "hsl(45 100% 60%)", icon: "Crown" },
  { name: "Legend", min: 12000, color: "hsl(350 95% 62%)", icon: "Flame" },
];

export function getTierFromXp(xp = 0) {
  let tier = LEVEL_TIERS[0];
  for (const t of LEVEL_TIERS) if (xp >= t.min) tier = t;
  return tier;
}

export function getNextTier(xp = 0) {
  return LEVEL_TIERS.find((t) => t.min > xp) || null;
}

export function getTierProgress(xp = 0) {
  const current = getTierFromXp(xp);
  const next = getNextTier(xp);
  if (!next) return { pct: 100, current, next: null, toGo: 0 };
  const span = next.min - current.min;
  const earned = xp - current.min;
  return { pct: Math.min(100, Math.round((earned / span) * 100)), current, next, toGo: next.min - xp };
}

export const BADGES = {
  first_lesson: { name: "First Steps", desc: "Completed your first lesson", icon: "Sparkles", color: "hsl(152 80% 55%)" },
  streak_7: { name: "7-Day Streak", desc: "Active 7 days in a row", icon: "Flame", color: "hsl(45 100% 60%)" },
  quiz_master: { name: "Quiz Master", desc: "Aced 5 quizzes in a row", icon: "Brain", color: "hsl(265 95% 66%)" },
  speed_coder: { name: "Speed Coder", desc: "Solved a challenge under 30 min", icon: "Zap", color: "hsl(185 100% 55%)" },
  fullstack_explorer: { name: "Full Stack Explorer", desc: "Tried all 6 tracks", icon: "Compass", color: "hsl(350 95% 62%)" },
  hundred_club: { name: "100 Problems Solved", desc: "A true grinder", icon: "Trophy", color: "hsl(45 100% 60%)" },
  mission_complete: { name: "Mission Complete", desc: "Finished a weekly AI mission", icon: "Target", color: "hsl(185 100% 55%)" },
};

export function xpToday() { return new Date().toISOString().split("T")[0]; }

export function isConsecutiveDay(lastDate) {
  if (!lastDate) return false;
  const last = new Date(lastDate);
  const today = new Date();
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  return diff === 1;
}