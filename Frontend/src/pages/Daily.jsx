import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { useSearchParams } from "react-router-dom";
import { Swords, Clock, Crown, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import GlassCard from "@/components/game/GlassCard";

function parseConcepts(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

export default function Daily() {
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const weekly = params.get("w") === "1";
  const today = new Date().toISOString().split("T")[0];

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get("/users/me"),
  });

  const {
    data: list = [],
    isError: dailyError,
    error: dailyErrorMsg,
  } = useQuery({
    queryKey: ["daily", today],
    queryFn: () => apiClient.get("/ai/daily"),
    retry: 1,
  });

  const { data: archive = [] } = useQuery({
    queryKey: ["dailyArchive"],
    queryFn: () => apiClient.get("/ai/daily/archive"),
  });

  const challenge = weekly
    ? list.find((d) => d.is_weekly)
    : list.find((d) => !d.is_weekly);

  const { data: subsList = [] } = useQuery({
    queryKey: ["mySubs", challenge?.id, me?.email],
    enabled: !!challenge && !!me,
    queryFn: () => apiClient.get(`/submissions?challenge_id=${challenge.id}`),
  });

  const attemptsUsed = subsList.length;
  const alreadyPassed = subsList.some((s) => s.passed);

  const [code, setCode] = useState("");
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [startTime]);

  useEffect(() => {
    if (challenge) {
      setCode((prev) => prev || challenge.starter_code || "");
    }
  }, [challenge?.id]);

  if (dailyError) {
    return (
      <GlassCard className="p-8 text-center">
        <Swords className="w-8 h-8 mx-auto text-destructive mb-2" />
        <div className="text-destructive font-medium">Failed to load challenge</div>
        <div className="text-muted-foreground text-xs mt-2 font-mono">
          {dailyErrorMsg?.message || String(dailyErrorMsg)}
        </div>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => qc.invalidateQueries(["daily", today])}
        >
          Retry
        </Button>
      </GlassCard>
    );
  }

  if (!challenge) {
    return (
      <GlassCard className="p-8 text-center">
        <Swords className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <div className="text-muted-foreground">
          No {weekly ? "weekly" : "daily"} challenge available yet.
        </div>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => qc.invalidateQueries(["daily", today])}
        >
          Retry
        </Button>
      </GlassCard>
    );
  }

  const submit = async () => {
    if (attemptsUsed >= 3) return toast.error("Out of attempts for today.");
    if (alreadyPassed) return toast("Already solved!");
    if (!code.trim()) return toast.error("Write a solution first!");
    setEvaluating(true);

    try {
      const result = await apiClient.post("/ai/daily/submit", {
        challenge_id: challenge.id,
        code,
        start_time: startTime,
      });

      if (result.passed) {
        if (result.xp_earned > challenge.xp_reward) {
          toast.success(`⚡ Speed bonus! +${result.xp_earned} XP earned!`);
        } else {
          toast.success(`+${result.xp_earned} XP earned!`);
        }

        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        await apiClient.post("/feed", {
          kind: "challenge",
          title: `Solved ${challenge.title}`,
          detail: `${timeTaken}s`,
          xp_gained: result.xp_earned,
        });
      } else {
        toast.error(
          `Solution didn't pass. ${3 - result.attempts_used} attempt(s) left. ${result.feedback}`
        );
      }

      qc.invalidateQueries(["me"]);
      qc.invalidateQueries(["mySubs", challenge.id, me?.email]);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Submission failed";
      toast.error(msg);
    } finally {
      setEvaluating(false);
    }
  };

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  const concepts = parseConcepts(challenge.expected_concepts);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
          {weekly ? (
            <>
              <Crown className="w-3 h-3 text-gold" /> Weekly
            </>
          ) : (
            <>
              <Swords className="w-3 h-3 text-accent" /> Daily
            </>
          )}
        </div>
        <h1 className="font-display text-4xl md:text-5xl mt-1">{challenge.title}</h1>
        <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-secondary">
            {challenge.difficulty}
          </span>
          <span className="flex items-center gap-1 text-gold">
            <Zap className="w-3.5 h-3.5" /> +{challenge.xp_reward} XP
          </span>
          <span className="flex items-center gap-1 text-accent">
            <Clock className="w-3.5 h-3.5" /> {minutes}:{seconds}
          </span>
          <span className="text-muted-foreground">
            Attempts: {attemptsUsed}/3
          </span>
        </div>
      </div>

      <GlassCard className="p-6 neon-border">
        <div className="text-sm whitespace-pre-wrap">{challenge.prompt}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {concepts.map((c) => (
            <span
              key={c}
              className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full glass"
            >
              {c}
            </span>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
          <div className="text-xs font-mono text-muted-foreground">solution.js</div>
          <div className="text-xs text-muted-foreground">{code.length} chars</div>
        </div>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
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
        <Button
          onClick={submit}
          disabled={evaluating || attemptsUsed >= 3 || alreadyPassed}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary"
        >
          {evaluating
            ? "Evaluating…"
            : alreadyPassed
            ? "✓ Already solved"
            : "Submit solution"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setCode(challenge.starter_code || "")}
          className="bg-transparent"
        >
          Reset code
        </Button>
      </div>

      {subsList.length > 0 && (
        <GlassCard className="p-5">
          <div className="font-display text-lg mb-3">Your attempts</div>
          <div className="space-y-2">
            {subsList.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">#{i + 1}</span>
                  <span className={s.passed ? "text-xp" : "text-destructive"}>
                    {s.passed ? "Passed" : "Failed"}
                  </span>
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
          {archive
            .filter((a) => a.id !== challenge.id)
            .slice(0, 6)
            .map((c) => (
              <GlassCard key={c.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.title}</div>
                  <span className="text-xs text-muted-foreground">{c.date}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {c.difficulty} · +{c.xp_reward} XP
                </div>
              </GlassCard>
            ))}
        </div>
      </div>
    </div>
  );
}
