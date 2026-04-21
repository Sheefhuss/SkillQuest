import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Target, Flame, Trophy, Zap, Crown, ArrowRight, Bot } from "lucide-react";
import GlassCard from "@/components/game/GlassCard";
import XpProgressBar from "@/components/game/XpProgressBar";
import TierBadge from "@/components/game/TierBadge";
import BadgeChip from "@/components/game/BadgeChip";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => apiClient.get("/users/me") });
  const today = new Date().toISOString().split("T")[0];
  
  const { data: dailyList = [] } = useQuery({
    queryKey: ["daily", today],
    queryFn: () => apiClient.get(`/daily?date=${today}`),
  });
  const { data: tracks = [] } = useQuery({
    queryKey: ["tracks"], 
    queryFn: () => apiClient.get("/tracks"),
  });
  const { data: topUsers = [] } = useQuery({
    queryKey: ["top-users"], 
    queryFn: () => apiClient.get("/users/top?limit=5"),
  });

  if (!me) return <Skeleton />;

  const dailyRegular = dailyList.find((d) => !d.is_weekly);
  const weekly = dailyList.find((d) => d.is_weekly);
  const xp = me.xp || 0;
  const name = me.display_name || (me.full_name || "").split(" ")[0] || "friend";
  const badges = (me.badges || []).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome strip */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Quest log</div>
            <h1 className="font-display text-4xl md:text-5xl mt-1">
              Welcome back, <span className="text-gradient">{name}</span>
            </h1>
          </div>
          <TierBadge xp={xp} />
        </div>
      </motion.div>

      {/* XP Hero */}
      <GlassCard className="p-6 md:p-8 neon-border relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full" />
        <div className="relative grid lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-gold" /> Total XP
            </div>
            <div className="font-display text-6xl md:text-7xl tabular-nums mt-1">
              {xp.toLocaleString()}
            </div>
            <div className="mt-6 max-w-md"><XpProgressBar xp={xp} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat icon={Flame} label="Streak" value={me.streak_days || 0} color="hsl(45 100% 60%)" />
            <MiniStat icon={Trophy} label="Solved" value={me.problems_solved || 0} color="hsl(185 100% 55%)" />
            <MiniStat icon={Crown} label="Badges" value={(me.badges || []).length} color="hsl(265 95% 66%)" />
          </div>
        </div>
      </GlassCard>

      {/* Daily + Weekly */}
      <div className="grid md:grid-cols-2 gap-5">
        <ChallengeCard challenge={dailyRegular} to="/daily" accent="hsl(185 100% 55%)" label="Daily Battle" icon={Swords} />
        <ChallengeCard challenge={weekly} to="/daily?w=1" accent="hsl(45 100% 60%)" label="Challenge of the Week" icon={Crown} />
      </div>

      {/* Tracks preview */}
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl md:text-3xl">Continue your path</h2>
        <Link to="/tracks" className="text-sm text-accent hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.slice(0, 3).map((t) => (
          <TrackPreview key={t.id} track={t} />
        ))}
      </div>

      {/* Bottom split */}
      <div className="grid lg:grid-cols-3 gap-5">
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl">Your badges</h3>
            <Link to="/profile" className="text-xs text-muted-foreground hover:text-foreground">See all</Link>
          </div>
          {badges.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No badges yet — complete your first lesson to earn one! ✨
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {badges.map((b) => <BadgeChip key={b} id={b} size="md" />)}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-display text-xl mb-4">Top players</h3>
          <div className="space-y-2">
            {topUsers.slice(0, 5).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40">
                <div className="w-6 text-center text-sm font-display text-muted-foreground">#{i + 1}</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-xs font-bold">
                  {(u.display_name || u.full_name || u.email || "U").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{u.display_name || u.full_name || u.email}</div>
                </div>
                <div className="font-display text-sm tabular-nums">{(u.xp || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <Link to="/leaderboard">
            <Button variant="outline" className="w-full mt-4 bg-transparent">Full leaderboard</Button>
          </Link>
        </GlassCard>
      </div>

      {/* AI assistant nudge */}
      <Link to="/assistant" className="block">
        <GlassCard hover className="p-6 flex items-center gap-4 neon-border cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center glow-primary">
            <Bot className="w-6 h-6 text-background" />
          </div>
          <div className="flex-1">
            <div className="font-display text-lg">Stuck on something?</div>
            <div className="text-sm text-muted-foreground">Ask the AI Tutor — explain, simplify, or make it harder.</div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </GlassCard>
      </Link>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl p-3 text-center"
      style={{ background: `linear-gradient(135deg, ${color}1f, transparent)`, boxShadow: `0 0 0 1px ${color}33` }}>
      <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ChallengeCard({ challenge, to, accent, label, icon: Icon }) {
  if (!challenge) return (
    <GlassCard className="p-6 opacity-60">
      <div className="text-sm text-muted-foreground">No {label.toLowerCase()} yet.</div>
    </GlassCard>
  );
  return (
    <Link to={to}>
      <GlassCard hover className="p-6 cursor-pointer relative overflow-hidden h-full">
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: `radial-gradient(400px 200px at 100% 0%, ${accent}22, transparent 60%)` }} />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color: accent }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: accent }}>{label}</span>
            </div>
            <div className="text-xs px-2 py-0.5 rounded-full glass">+{challenge.xp_reward} XP</div>
          </div>
          <div className="font-display text-2xl">{challenge.title}</div>
          <div className="text-sm text-muted-foreground mt-2 line-clamp-2">{challenge.prompt}</div>
          <div className="mt-4 inline-flex items-center gap-1 text-sm" style={{ color: accent }}>
            Start now <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

function TrackPreview({ track }) {
  return (
    <Link to={`/tracks/${track.slug}`}>
      <GlassCard hover className="p-5 cursor-pointer h-full">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl grid place-items-center"
            style={{ background: `${track.accent_color}22`, boxShadow: `0 0 0 1px ${track.accent_color}55` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: track.accent_color }} />
          </div>
          {!track.is_free && <div className="text-[10px] uppercase tracking-widest text-gold">Pro</div>}
        </div>
        <div className="font-display text-lg mt-3">{track.title}</div>
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{track.description}</div>
      </GlassCard>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-60 shimmer rounded-md" />
      <div className="h-48 shimmer rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="h-40 shimmer rounded-2xl" />
        <div className="h-40 shimmer rounded-2xl" />
      </div>
    </div>
  );
}