import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Play, CheckCircle2, Sparkles, Award } from "lucide-react";
import GlassCard from "@/components/game/GlassCard";

export default function TrackDetail() {
  const { slug } = useParams();
  const nav = useNavigate();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get("/users/me"),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => apiClient.get("/tracks"),
  });

  const { data: allLevels = [] } = useQuery({
    queryKey: ["levels"],
    queryFn: () => apiClient.get("/levels"),
});
  const levels = allLevels.filter((l) => l.track_slug === slug);
  const track = tracks.find((t) => t.slug === slug);
  if (!track) return <div className="text-muted-foreground">Loading…</div>;

  const completed = new Set(me?.completed_levels || []);

  return (
    <div className="space-y-6">
      <button
        onClick={() => nav(-1)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-10 neon-border">
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[120px]"
          style={{ background: track.accent_color + "55" }}
        />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {track.category}
          </div>
          <h1 className="font-display text-4xl md:text-6xl mt-2">{track.title}</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">{track.description}</p>
        </div>
      </div>

      {levels.length === 0 && (
        <GlassCard className="p-8 text-center text-muted-foreground text-sm">
          No levels found for this track yet.
        </GlassCard>
      )}

      <div className="space-y-3">
        {levels.map((lvl, i) => {
          const prev = levels[i - 1];
          const locked = i > 0 && prev && !completed.has(prev.id);
          const done = completed.has(lvl.id);

          return (
            <motion.div
              key={lvl.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={locked ? "#" : `/level/${lvl.id}`}
                onClick={(e) => locked && e.preventDefault()}
              >
                <GlassCard
                  hover={!locked}
                  className={`p-5 md:p-6 flex items-center gap-4 ${locked ? "opacity-60" : ""}`}
                >
                  <div
                    className="w-14 h-14 rounded-2xl grid place-items-center shrink-0"
                    style={{
                      background: done
                        ? `linear-gradient(135deg, ${track.accent_color}44, ${track.accent_color}11)`
                        : `linear-gradient(135deg, hsl(240 18% 12%), hsl(240 18% 9%))`,
                      boxShadow: `0 0 0 1px ${track.accent_color}55`,
                    }}
                  >
                    {done ? (
                      <CheckCircle2 className="w-6 h-6" style={{ color: track.accent_color }} />
                    ) : locked ? (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Play className="w-5 h-5" style={{ color: track.accent_color }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          background: `${track.accent_color}22`,
                          color: track.accent_color,
                        }}
                      >
                        {lvl.tier}
                      </span>
                      {done && (
                        <span className="text-[10px] uppercase tracking-widest text-xp flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                    <div className="font-display text-xl mt-1">{lvl.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{lvl.summary}</div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <Award className="w-3.5 h-3.5" /> +{lvl.xp_reward}
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}