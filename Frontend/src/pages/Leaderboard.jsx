import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { motion } from "framer-motion";
import { Trophy, Flame, Crown, Medal } from "lucide-react";
import GlassCard from "@/components/game/GlassCard";

export default function Leaderboard() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => apiClient.get("/users/top?limit=100"),
  });

  if (isLoading) return <div className="text-muted-foreground">Loading ranks...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <Trophy className="w-12 h-12 mx-auto text-gold mb-2" />
        <h1 className="font-display text-4xl md:text-5xl mt-1">Hall of <span className="text-gradient">Fame</span></h1>
        <p className="text-muted-foreground mt-2">The top 100 developers across the globe.</p>
      </div>

      <GlassCard className="p-0 overflow-hidden neon-border mt-8">
        <div className="divide-y divide-border/50">
          {users.map((u, i) => (
            <motion.div 
              key={u.id || i} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors ${i < 3 ? 'bg-primary/5' : ''}`}
            >
              <div className="w-8 text-center font-display text-lg">
                {i === 0 ? <Crown className="w-6 h-6 text-gold mx-auto" /> : 
                 i === 1 ? <Medal className="w-6 h-6 text-zinc-400 mx-auto" /> : 
                 i === 2 ? <Medal className="w-6 h-6 text-amber-700 mx-auto" /> : 
                 <span className="text-muted-foreground">#{i + 1}</span>}
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-bold shadow-lg">
                {(u.display_name || u.full_name || u.email || "U").slice(0, 2).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-base font-medium truncate">{u.display_name || u.full_name || u.email}</div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {u.streak_days || 0} day streak</span>
                  <span>Level: {u.level_tier || "Rookie"}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-display text-xl text-gold tabular-nums">{(u.xp || 0).toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total XP</div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}