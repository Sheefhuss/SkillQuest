import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { useSearchParams } from "react-router-dom";
import { Swords, Clock, Crown, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import GlassCard from "@/components/game/GlassCard";

const LANGUAGES = [
  { id: "javascript", label: "JS",     filename: "solution.js"   },
  { id: "python",     label: "Python", filename: "solution.py"   },
  { id: "java",       label: "Java",   filename: "Solution.java" },
  { id: "c",          label: "C",      filename: "solution.c"    },
  { id: "cpp",        label: "C++",    filename: "solution.cpp"  },
];
function getDefaultStarter(langId, challenge) {
  if (langId === "javascript") return challenge?.starter_code || "function solution(arr) {\n  // Write your solution here\n}";
  const match = (challenge?.starter_code || "").match(/\(([^)]*)\)/);
  const params = match ? match[1] : "input";

  const templates = {
    python: `def solution(${params}):\n    # Write your solution here\n    pass`,
    java:   `public class Solution {\n    public static void solution(${params}) {\n        // Write your solution here\n    }\n}`,
    c:      `#include <stdio.h>\n\nvoid solution(int arr[], int n) {\n    // Write your solution here\n}`,
    cpp:    `#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid solution(vector<int>& arr) {\n    // Write your solution here\n}`,
  };
  return templates[langId] || `// Write your ${langId} solution here`;
}

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

  const [language, setLanguage]   = useState("javascript");
  const [code, setCode]           = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [startTime]               = useState(() => Date.now());
  const [elapsed, setElapsed]     = useState(0);
  const codeByLangRef = useRef({});
  
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [startTime]);
  useEffect(() => {
    if (challenge) {
      setLanguage("javascript");
      codeByLangRef.current = {}; 
      setCode(getDefaultStarter("javascript", challenge));
    }
  }, [challenge?.id]);
  const handleLanguageSwitch = (langId) => {
    if (langId === language) return;
    codeByLangRef.current[language] = code;
    const saved = codeByLangRef.current[langId];
    setLanguage(langId);
    setCode(saved !== undefined ? saved : getDefaultStarter(langId, challenge));
  };

  const resetCode = () => {
    codeByLangRef.current[language] = undefined;
    setCode(getDefaultStarter(language, challenge));
  };

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
    if (alreadyPassed)     return toast("Already solved!");
    if (!code.trim())      return toast.error("Write a solution first!");

    setEvaluating(true);
    try {
      const result = await apiClient.post("/ai/daily/submit", {
        challenge_id: challenge.id,
        code,
        language,    
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
          detail: `${timeTaken}s · ${language}`,
          xp_gained: result.xp_earned,
        });
      } else {
        toast.error(
          `Didn't pass. ${3 - result.attempts_used} attempt(s) left. ${result.feedback}`
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

  const minutes  = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds  = String(elapsed % 60).padStart(2, "0");
  const concepts = parseConcepts(challenge.expected_concepts);
  const activeLang = LANGUAGES.find((l) => l.id === language);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
          {weekly ? (
            <><Crown className="w-3 h-3 text-gold" /> Weekly</>
          ) : (
            <><Swords className="w-3 h-3 text-accent" /> Daily</>
          )}
        </div>
        <h1 className="font-display text-4xl md:text-5xl mt-1">{challenge.title}</h1>
        <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-secondary">{challenge.difficulty}</span>
          <span className="flex items-center gap-1 text-gold">
            <Zap className="w-3.5 h-3.5" /> +{challenge.xp_reward} XP
          </span>
          <span className="flex items-center gap-1 text-accent">
            <Clock className="w-3.5 h-3.5" /> {minutes}:{seconds}
          </span>
          <span className="text-muted-foreground">Attempts: {attemptsUsed}/3</span>
        </div>
      </div>

      {/* Problem statement */}
      <GlassCard className="p-6 neon-border">
        <div className="text-sm whitespace-pre-wrap">{challenge.prompt}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {concepts.map((c) => (
            <span key={c} className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full glass">
              {c}
            </span>
          ))}
        </div>
      </GlassCard>

      {/* Code editor */}
      <GlassCard className="p-0 overflow-hidden">

        {/* Language tabs */}
        <div className="flex items-center gap-1 px-3 pt-2 border-b border-border/60 overflow-x-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageSwitch(lang.id)}
              className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors whitespace-nowrap ${
                language === lang.id
                  ? "bg-secondary text-foreground border border-b-0 border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
          <div className="ml-auto text-xs text-muted-foreground pb-1.5 pl-2 shrink-0">
            {code.length} chars
          </div>
        </div>

        {/* Filename bar */}
        <div className="flex items-center px-4 py-1.5 border-b border-border/40 bg-secondary/30">
          <div className="text-xs font-mono text-muted-foreground">{activeLang.filename}</div>
        </div>

        {/* Editor */}
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono min-h-[320px] bg-transparent border-0 rounded-none focus-visible:ring-0"
          placeholder="Write your solution here…"
          spellCheck={false}
        />
      </GlassCard>

      {/* Out of attempts warning */}
      {attemptsUsed >= 3 && !alreadyPassed && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4" /> Out of attempts. Try again tomorrow!
        </div>
      )}

      {/* Actions */}
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
          onClick={resetCode}
          className="bg-transparent"
        >
          Reset code
        </Button>
      </div>

      {/* Attempt history */}
      {subsList.length > 0 && (
        <GlassCard className="p-5">
          <div className="font-display text-lg mb-3">Your attempts</div>
          <div className="space-y-2">
            {subsList.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between text-sm gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground">#{i + 1}</span>
                  <span className={s.passed ? "text-xp" : "text-destructive"}>
                    {s.passed ? "Passed" : "Failed"}
                  </span>
                  {/*  Show language used */}
                  {s.language && (
                    <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded glass text-muted-foreground">
                      {s.language}
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground text-xs text-right">{s.ai_feedback}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Past challenges */}
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
