import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Clock, Crown, Zap, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import GlassCard from "@/components/game/GlassCard";
import { BADGES } from "@/lib/game";

export default function Daily() {
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const weekly = params.get("w") === "1";
  const today = new Date().toISOString().split("T")[0];
  
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => apiClient.get("/users/me") });
  const { data: list = [] } = useQuery({
    queryKey: ["daily", today], queryFn: () => apiClient.get(`/daily?date=${today}`),
  });
  const { data: archive = [] } = useQuery({
    queryKey: ["dailyArchive"], queryFn: () => apiClient.get("/daily/archive"),
  });

  const challenge = weekly ? list.find((d) => d.is_weekly) : list.find((d) => !d.is_weekly);

  const { data: subsList = [] } = useQuery({
    queryKey: ["mySubs", challenge?.id, me?.email],
    enabled: !!challenge && !!me,
    queryFn: () => apiClient.get(`/submissions?challenge_id=${challenge.id}`),
  });

  const attemptsUsed = subsList.length;
  const alreadyPassed = subsList.some((s) => s.passed);

  const [code, setCode] = useState("");
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  useEffect(() => {
    if (challenge && !code) setCode(challenge.starter_code || "");
  }, [challenge]);

  if (!challenge) return (
    <GlassCard className="p-8 text-center">
      <Swords className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
      <div className="text-muted-foreground">No {weekly ? "weekly" : "daily"} challenge available yet.</div>
    </GlassCard>
  );

  const submit = async () => {
    if (attemptsUsed >= 3) return toast.error("Out of attempts for today.");
    if (alreadyPassed) return toast("Already solved!");
    if (!code.trim()) return toast.error("Write a solution first!");
    setEvaluating(true);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const hasConcept = (challenge.expected_concepts || []).some((c) =>
      code.toLowerCase().includes(c.toLowerCase())
    );
    const looksLikeCode = code.length > 30 && /[{}()=;]/.test(code);
    const passed = looksLikeCode && (hasConcept || code.length > 120);

    let xpEarned = 0;
    if (passed) {
      xpEarned = challenge.xp_reward;
      if (!weekly && timeTaken < 1800) xpEarned += 25;
    }

    await apiClient.post("/submissions", {
      challenge_id: challenge.id,
      code,
      attempts: attemptsUsed + 1,
      passed,
      time_taken_seconds: timeTaken,
      xp_earned: xpEarned,
      ai_feedback: passed
        ? "Looks good! Your code matches the expected structure."
        : "Not quite — missing key concepts or too short. Try again!",
    });

    if (passed) {
      const updates = {
        xp: (me.xp || 0) + xpEarned,
        problems_solved: (me.problems_solved || 0) + 1,
      };
      const newBadges = [...(me.badges || [])];
      if (!weekly && timeTaken < 1800 && !newBadges.includes("speed_coder")) {
        newBadges.push("speed_coder");
        toast.success(`🏅 ${BADGES.speed_coder.name} unlocked!`);
      }
      if ((me.problems_solved || 0) + 1 >= 100 && !newBadges.includes("hundred_club")) {
        newBadges.push("hundred_club");
        toast.success(`🏅 ${BADGES.hundred_club.name} unlocked!`);
      }
      updates.badges = newBadges;
      
      await apiClient.patch("/users/me", updates);
      await apiClient.post("/feed", {
        kind: "challenge", title: `Solved ${challenge.title}`, detail: `${timeTaken}s`, xp_gained: xpEarned,
      });
      toast.success(`+${xpEarned} XP earned!`);
    } else {
      toast.error("Solution didn't pass. " + (3 - attemptsUsed - 1) + " attempt(s) left.");
    }
    qc.invalidateQueries();
    setEvaluating(false);
  };

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
          {weekly ? <><Crown className="w-3 h-3 text-gold" /> Weekly</> : <><Swords className="w-3 h-3 text-accent" /> Daily</>}
        </div>
        <h1 className="font-display text-4xl md:text-5xl mt-1">{challenge.title}</h1>
        <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-secondary">{challenge.difficulty}</span>
          <span className="flex items-center gap-1 text-gold"><Zap className="w-3.5 h-3.5" /> +{challenge.xp_reward} XP</span>
          <span className="flex items-center gap-1 text-accent"><Clock className="w-3.5 h-3.5" /> {minutes}:{seconds}</span>
          <span className="text-muted-foreground">Attempts: {attemptsUsed}/3</span>
        </div>
      </div>

      <GlassCard className="p-6 neon-border">
        <div className="text-sm whitespace-pre-wrap">{challenge.prompt}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(challenge.expected_concepts || []).map((c) => (
            <span key={c} className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full glass">{c}</span>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
          <div className="text-xs font-mono text-muted-foreground">solution.js</div>
          <div className="text-xs text-muted-foreground">{code.length} chars</div>
        </div>
        <Textarea
          value={code} onChange={(e) => setCode(e.target.value)}
          className="font-mono min-h-[320px] bg-transparent border-0 rounded-none focus-visible:ring-0"
          placeholder="// Write your solution here"
        />
      </GlassCard>

      {attemptsUsed >= 3 && !alreadyPassed && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4" /> Out of attempts. Try again tomorrow!
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={submit} disabled={evaluating || attemptsUsed >= 3 || alreadyPassed}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary">
          {evaluating ? "Evaluating…" : alreadyPassed ? "✓ Already solved" : "Submit solution"}
        </Button>
        <Button variant="outline" onClick={() => setCode(challenge.starter_code || "")}
          className="bg-transparent">Reset code</Button>
      </div>

      {subsList.length > 0 && (
        <GlassCard className="p-5">
          <div className="font-display text-lg mb-3">Your attempts</div>
          <div className="space-y-2">
            {subsList.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">#{i + 1}</span>
                  <span className={s.passed ? "text-xp" : "text-destructive"}>{s.passed ? "Passed" : "Failed"}</span>
                </div>
                <div className="text-muted-foreground text-xs">{s.ai_feedback}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div>
        <h3 className="font-display text-xl mt-6 mb-3">Past challenges</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {archive.filter((a) => a.id !== challenge.id).slice(0, 6).map((c) => (
            <GlassCard key={c.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.title}</div>
                <span className="text-xs text-muted-foreground">{c.date}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{c.difficulty} · +{c.xp_reward} XP</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}