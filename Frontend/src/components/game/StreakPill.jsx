import React from "react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function StreakPill({ days = 0, compact = false }) {
  const hot = days >= 3;
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass ${hot ? "glow-gold" : ""}`}
    >
      <Flame className={`w-4 h-4 ${hot ? "text-gold" : "text-muted-foreground"}`} />
      <div className="font-display text-sm tabular-nums">{days}</div>
      {!compact && <span className="text-[10px] uppercase tracking-widest text-muted-foreground">day streak</span>}
    </motion.div>
  );
}