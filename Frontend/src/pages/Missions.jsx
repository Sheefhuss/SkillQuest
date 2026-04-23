import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { motion } from "framer-motion";
import { Target, Sparkles, CheckCircle2, Bot, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GlassCard from "@/components/game/GlassCard";
import { usePlanLimits } from "@/lib/usePlanLimits";
import { Link } from "react-router-dom";

function weekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}

function evaluateObjective(o, weekSubs, completedLevels, me) {
  const label = o.label.toLowerCase();
  let progress = 0;

  if (
    label.includes("coding challenge") ||
    label.includes("exercise") ||
    label.includes("puzzle") ||
    label.includes("challenge") ||
    label.includes("submission") ||
    label.includes("question") ||
    label.includes("problem")
  ) {
    progress = Math.min(weekSubs.length, o.target);
  } else if (
    label.includes("level") ||
    label.includes("complete a level") ||
    label.includes("finish a level")
  ) {
    progress = Math.min(completedLevels, o.target);
  } else if (label.includes("streak") || label.includes("day")) {
    progress = Math.min(me?.streak_days || 0, o.target);
  } else if (label.includes("badge")) {
    progress = Math.min((me?.badges || []).length, o.target);
  } else {
    progress = Math.min(weekSubs.length, o.target);
  }

  return { ...o, progress, completed: progress >= o.target };
}

export default function Missions() {
  const qc = useQueryClient();
  const ws = weekStart();
  const { isPro, canAccessMissions } = usePlanLimits();
  const evaluatedRef = useRef(false);
  const [generating, setGenerating] = useState(false);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get("/users/me"),
  });

  const { data: missions = [] } = useQuery({
    enabled: !!me && isPro,
    queryKey: ["missions", ws],
    queryFn: () => apiClient.get(`/missions?week_start=${ws}`),
  });

  const { data: submissions = [] } = useQuery({
    enabled: !!me && isPro,
    queryKey: ["submissions", me?.email],
    queryFn: () => apiClient.get(`/submissions?user_email=${me?.email}`),
  });

  const current = missions[0];

  useEffect(() => {
    if (!current || !me || current.completed) return;
    if (evaluatedRef.current) return;

    const weekSubs = submissions.filter(
      (s) => s.createdAt?.slice(0, 10) >= ws
    );
    const completedLevels = (me.completed_levels || []).length;

    const updated = current.objectives.map((o) =>
      evaluateObjective(o, weekSubs, completedLevels, me)
    );

    const changed = updated.some(
      (o, i) =>
        o.completed !== current.objectives[i].completed ||
        o.progress !== current.objectives[i].progress
    );

    if (!changed) return;

    evaluatedRef.current = true;

    const allDone = updated.every((o) => o.completed);

    apiClient
      .patch(`/missions/${current.id}`, {
        objectives: updated,
        completed: allDone,
      })
      .then(async () => {
        if (allDone && !current.completed) {
          await apiClient.patch("/users/me", {
            xp: (me.xp || 0) + current.xp_reward,
            badges: [
              ...new Set([...(me.badges || []), "mission_complete"]),
            ],
          });
          toast.success(`Mission complete! +${current.xp_reward} XP 🎉`);
        }
        qc.invalidateQueries();
      });
  }, [current?.id, submissions.length, me?.email]);

  const generate = async () => {
    if (!canAccessMissions) return toast.error("AI Missions are a Pro feature.");
    setGenerating(true);
    evaluatedRef.current = false;
    try {
      const aiMission = await apiClient.post("/ai/mission", {
        profile: me,
        week_start: ws,
      });
      await apiClient.post("/missions", {
        ...aiMission,
        user_email: me.email,
        week_start: ws,
        completed: false,
      });
      qc.invalidateQueries({ queryKey: ["missions"] });
      toast.success("New mission ready!");
    } catch (err) {
      toast.error("Failed to generate mission. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          AI personalised
        </div>
        <h1 className="font-display text-4xl md:text-5xl mt-1">
          Weekly <span className="text-gradient">Missions</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Your AI strategist tailors a weekly quest to your skill level.
        </p>
      </div>

      {!isPro && (
        <GlassCard className="p-8 text-center space-y-4 neon-border">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/10 border border-gold/30 grid place-items-center">
            <Lock className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h2 className="font-display text-2xl">Pro feature</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
              AI-personalised weekly missions are exclusive to Pro members.
              Upgrade to get a quest tailored to your exact skill level every
              week.
            </p>
          </div>
          <div className="text-left max-w-xs mx-auto space-y-2 text-sm text-muted-foreground">
            {[
              "Personalised to your weak spots",
              "New mission every Monday",
              "Earn bonus XP on completion",
              "Tracked progress & objectives",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" /> {f}
              </div>
            ))}
          </div>
          <Link to="/pro">
            <Button className="bg-gradient-to-r from-gold to-destructive text-background font-semibold px-6">
              <Crown className="w-4 h-4 mr-2" /> Upgrade to Pro
            </Button>
          </Link>
        </GlassCard>
      )}

      {isPro && (
        <>
          {!current ? (
            <GlassCard className="p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center glow-primary mb-3">
                <Bot className="w-7 h-7 text-background" />
              </div>
              <div className="font-display text-2xl">
                No mission for this week yet
              </div>
              <p className="text-muted-foreground mt-1">
                Let the AI craft your next quest.
              </p>
              <Button
                onClick={generate}
                disabled={generating}
                className="mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                {generating ? "Summoning…" : "Generate my mission"}
              </Button>
            </GlassCard>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-6 md:p-8 relative overflow-hidden neon-border">
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[120px] bg-primary/40" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
                    <Target className="w-3.5 h-3.5" /> {current.difficulty} ·
                    +{current.xp_reward} XP
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl mt-2">
                    {current.title}
                  </h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    {current.narrative}
                  </p>
                  <div className="mt-6 space-y-3">
                    {current.objectives?.map((o, i) => (
                      <div
                        key={i}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-secondary/20"
                      >
                        <div
                          className={`w-6 h-6 rounded-full grid place-items-center border-2 shrink-0 ${
                            o.completed
                              ? "bg-xp border-xp"
                              : "border-border"
                          }`}
                        >
                          {o.completed && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-background" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div
                            className={
                              o.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }
                          >
                            {o.label}
                          </div>
                          <div className="mt-1 h-1 rounded-full bg-border overflow-hidden w-full">
                            <div
                              className="h-full bg-xp rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ((o.progress || 0) / o.target) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          {o.progress || 0}/{o.target}
                        </div>
                      </div>
                    ))}
                  </div>
                  {current.completed && (
                    <div className="mt-6 flex items-center gap-2 text-xp">
                      <Sparkles className="w-4 h-4" /> Mission complete! XP
                      awarded.
                    </div>
                  )}
                  {current.completed && (
                    <Button
                      onClick={generate}
                      disabled={generating}
                      className="mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      {generating ? "Summoning…" : "Generate next mission"}
                    </Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
