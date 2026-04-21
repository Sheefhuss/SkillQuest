import React from "react";
import { motion } from "framer-motion";
import { getTierProgress } from "@/lib/game";

export default function XpProgressBar({ xp = 0 }) {
  const { pct, current, next, toGo } = getTierProgress(xp);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span className="uppercase tracking-[0.2em]">{current.name}</span>
        {next && <span>{toGo.toLocaleString()} XP to {next.name}</span>}
      </div>
      <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 xp-bar"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 pointer-events-none shimmer opacity-20" />
      </div>
    </div>
  );
}