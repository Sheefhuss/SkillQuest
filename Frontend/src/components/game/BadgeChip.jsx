import React from "react";
import { Sparkles, Flame, Brain, Zap, Compass, Trophy, Target, Award } from "lucide-react";
import { BADGES } from "@/lib/game";

const ICONS = { Sparkles, Flame, Brain, Zap, Compass, Trophy, Target, Award };

export default function BadgeChip({ id, size = "md" }) {
  const b = BADGES[id];
  if (!b) return null;
  const IconCmp = ICONS[b.icon] || Award;
  const sizes = {
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizes[size]} rounded-xl grid place-items-center relative`}
        style={{
          background: `radial-gradient(circle at 30% 20%, ${b.color}33, transparent 60%), linear-gradient(135deg, hsl(240 18% 10%), hsl(240 18% 7%))`,
          boxShadow: `0 0 0 1px ${b.color}55, 0 10px 30px -10px ${b.color}77`,
        }}
      >
        <IconCmp className="w-5 h-5" style={{ color: b.color }} />
      </div>
      {size !== "sm" && <div className="text-[10px] text-muted-foreground text-center leading-tight max-w-[80px]">{b.name}</div>}
    </div>
  );
}