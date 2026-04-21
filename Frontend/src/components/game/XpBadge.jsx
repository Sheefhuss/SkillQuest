import React from "react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import { getTierFromXp } from "@/lib/game";

export default function XpBadge({ xp = 0, compact = false }) {
  const tier = getTierFromXp(xp);
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full glass glow-primary"
    >
      <div className="w-6 h-6 rounded-full grid place-items-center bg-gradient-to-br from-primary to-accent">
        <Zap className="w-3.5 h-3.5 text-background" strokeWidth={3} />
      </div>
      <div className="leading-tight">
        <div className="font-display text-sm tabular-nums">{xp.toLocaleString()} XP</div>
        {!compact && <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{tier.name}</div>}
      </div>
    </motion.div>
  );
}