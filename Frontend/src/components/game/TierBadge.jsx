import React from "react";
import { Sparkles, Code2, Cpu, Crown, Flame } from "lucide-react";
import { getTierFromXp } from "@/lib/game";

const ICONS = { Sparkles, Code2, Cpu, Crown, Flame };

export default function TierBadge({ xp = 0 }) {
  const tier = getTierFromXp(xp);
  const IconCmp = ICONS[tier.icon] || Sparkles;
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass"
      style={{ boxShadow: `0 0 0 1px ${tier.color}44, 0 10px 30px -10px ${tier.color}66` }}>
      <IconCmp className="w-4 h-4" style={{ color: tier.color }} />
      <span className="text-xs font-medium" style={{ color: tier.color }}>{tier.name}</span>
    </div>
  );
}