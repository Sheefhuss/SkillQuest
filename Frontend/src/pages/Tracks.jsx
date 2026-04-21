import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/game/GlassCard";
import { usePlanLimits } from "@/lib/usePlanLimits";
import {
  Globe, Binary, Network, Database, Server, Plug, Code2, Lock, Crown, ArrowRight,
} from "lucide-react";

const ICONS = { Globe, Binary, Network, Database, Server, Plug };

export default function Tracks() {
  const { isPro, canAccessTrack } = usePlanLimits();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get("/users/me"),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => apiClient.get("/tracks"),
  });

  const { data: levels = [] } = useQuery({
    queryKey: ["levels"],
    queryFn: () => apiClient.get("/levels"),
  });

  const completed = new Set(me?.completed_levels || []);

  const freeTrackCount = tracks.filter((t) => t.is_free).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Skill atlas</div>
        <h1 className="font-display text-4xl md:text-5xl mt-1">Choose your <span className="text-gradient">path</span></h1>
        <p className="text-muted-foreground mt-2">Progress locks until you master each tier.</p>
      </div>

      {/* Free plan notice */}
      {!isPro && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-gold/8 border border-gold/20">
          <div className="flex items-center gap-2 text-sm">
            <Crown className="w-4 h-4 text-gold shrink-0" />
            <span className="text-muted-foreground">
              Free plan includes <span className="text-foreground font-medium">{freeTrackCount} of {tracks.length} tracks</span>. Upgrade to unlock all.
            </span>
          </div>
          <Link to="/pro" className="shrink-0 text-xs font-semibold text-gold hover:underline">Go Pro →</Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tracks.map((t, i) => {
          const trackLevels = levels.filter((l) => l.track_slug === t.slug);
          const done = trackLevels.filter((l) => completed.has(l.id)).length;
          const pct = trackLevels.length ? Math.round((done / trackLevels.length) * 100) : 0;
          const IconCmp = ICONS[t.icon] || Globe;
          const locked = !canAccessTrack(t);

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={locked ? "/pro" : `/tracks/${t.slug}`}>
                <GlassCard hover={!locked} className={`p-6 h-full relative overflow-hidden transition-opacity ${locked ? "opacity-60" : ""}`}>
                  <div
                    className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ background: t.accent_color }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl grid place-items-center"
                        style={{
                          background: `${t.accent_color}22`,
                          boxShadow: `0 0 0 1px ${t.accent_color}55`,
                        }}
                      >
                        <IconCmp className="w-5 h-5" style={{ color: locked ? "gray" : t.accent_color }} />
                      </div>

                      {locked ? (
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold">
                          <Crown className="w-3 h-3" /> Pro
                        </div>
                      ) : (
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {t.category}
                        </div>
                      )}
                    </div>

                    <div className="font-display text-2xl">{t.title}</div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>

                    {locked ? (
                      
                      <div className="mt-5 flex items-center gap-2 text-sm text-gold">
                        <Lock className="w-3.5 h-3.5" /> Upgrade to unlock
                      </div>
                    ) : (
                      <>
                        <div className="mt-5 space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{done}/{trackLevels.length} levels</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: t.accent_color }}
                            />
                          </div>
                        </div>
                        <div className="mt-5 inline-flex items-center gap-1 text-sm" style={{ color: t.accent_color }}>
                          Continue <ArrowRight className="w-4 h-4" />
                        </div>
                      </>
                    )}
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