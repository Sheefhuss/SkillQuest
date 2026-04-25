import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, Play, CheckCircle2, BookOpen,
  Code2, HelpCircle, Sparkles, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import GlassCard from "@/components/game/GlassCard";
import { BADGES } from "@/lib/game";

const ALL_LANGUAGES = [
  { id: "javascript", label: "JS",     filename: "solution.js"   },
  { id: "python",     label: "Python", filename: "solution.py"   },
  { id: "java",       label: "Java",   filename: "Solution.java" },
  { id: "c",          label: "C",      filename: "solution.c"    },
  { id: "cpp",        label: "C++",    filename: "solution.cpp"  },
];

const HTML_ONLY_IDS   = [15, 29];
const SQL_ONLY_IDS    = [26];
const DOCKER_ONLY_IDS = [27];
const JS_ONLY_IDS     = [16, 17, 18, 19, 30, 31, 32, 33];
const TEXT_ONLY_IDS   = [25, 28];

const JS_ONLY_LANGS = [
  { id: "javascript", label: "JS", filename: "solution.js" },
];

function getLanguagesForLevel(levelId) {
  if (HTML_ONLY_IDS.includes(levelId))   return [{ id: "html",   label: "HTML",       filename: "index.html" }];
  if (SQL_ONLY_IDS.includes(levelId))    return [{ id: "sql",    label: "SQL",        filename: "query.sql"  }];
  if (DOCKER_ONLY_IDS.includes(levelId)) return [{ id: "docker", label: "Dockerfile", filename: "Dockerfile" }];
  if (TEXT_ONLY_IDS.includes(levelId))   return [{ id: "text",   label: "Design",     filename: "design.txt" }];
  if (JS_ONLY_IDS.includes(levelId))     return JS_ONLY_LANGS;
  return ALL_LANGUAGES;
}

function getDefaultStarter(langId, starterJs = "") {
  if (langId === "javascript") return starterJs || "function solution() {\n  \n}";
  const match = (starterJs || "").match(/\(([^)]*)\)/);
  const params = match ? match[1] : "input";
  const templates = {
    python:  `def solution(${params}):\n    # your code here\n    pass`,
    java:    `public class Solution {\n    public static void solution(${params}) {\n        // your code here\n    }\n}`,
    c:       `#include <stdio.h>\n\nvoid solution(int arr[], int n) {\n    // your code here\n}`,
    cpp:     `#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solution(auto ${params}) {\n    // your code here\n}`,
  };
  return templates[langId] || `// Write your ${langId} solution here`;
}

export default function LevelDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get("/users/me"),
  });
  const { data: level } = useQuery({
    queryKey: ["level", id],
    queryFn: () => apiClient.get(`/levels/${id}`),
  });

  const [step, setStep]               = useState("lesson");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizDone, setQuizDone]       = useState(false);
  const [language, setLanguage]       = useState("");
  const [code, setCode]               = useState("");
  const [evaluating, setEvaluating]   = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);
  const [evalResult, setEvalResult]   = useState(null);

  const codeByLangRef = useRef({});

  if (!level) return <div className="text-muted-foreground">Loading…</div>;

  const LANGUAGES = getLanguagesForLevel(level.id);
  const completed = (me?.completed_levels || []).includes(level.id);
  const alreadySolvedChallenge = (me?.solved_levels || []).includes(level.id);

  const handleLanguageSwitch = (langId) => {
    if (langId === activeLangId) return;
    codeByLangRef.current[activeLangId] = code;
    const saved = codeByLangRef.current[langId];
    setLanguage(langId);
    setCode(saved !== undefined ? saved : getDefaultStarter(langId, level.challenge_starter));
  };

  const resetCode = () => {
    codeByLangRef.current[activeLangId] = undefined;
    setCode(getDefaultStarter(activeLangId, level.challenge_starter));
    setEvalResult(null);
  };

  const activeLangId = language || LANGUAGES[0]?.id;
  const activeLang = LANGUAGES.find((l) => l.id === activeLangId) || LANGUAGES[0];

  const initCode = () => {
    if (!code) setCode(getDefaultStarter(activeLangId, level.challenge_starter));
    if (!language) setLanguage(LANGUAGES[0]?.id);
  };

  const awardXP = async (amount, activity) => {
    await apiClient.patch("/users/me", { xp: (me?.xp || 0) + amount });
    toast.success(`+${amount} XP — ${activity}`);
    qc.invalidateQueries({ queryKey: ["me"] });
  };

  const submitQuiz = async () => {
    const score = level.quiz.reduce(
      (acc, q, i) => acc + (quizAnswers[i] === q.correct_index ? 1 : 0), 0
    );
    setQuizDone(true);
    await awardXP(20, "Quiz completed");
    toast.success(`You scored ${score}/${level.quiz.length}`);
  };

  const completeLesson = async () => {
    if (!(me?.badges || []).includes("first_lesson")) {
      await apiClient.patch("/users/me", {
        badges: [...(me?.badges || []), "first_lesson"],
      });
      toast.success(`🏅 Badge earned: ${BADGES.first_lesson?.name || "First Lesson"}`);
    }
    await awardXP(10, "Lesson watched");
    setStep("reading");
  };

  const submitChallenge = async () => {
    if (!code.trim()) return toast.error("Write a solution first!");

    const isCode = code.trim().length > 20 && /[=(){};:\[\]]/.test(code);
    if (!isCode) {
      toast.error("That doesn't look like code. Write a proper solution.");
      return;
    }

    setEvaluating(true);
    setEvalResult(null);

    try {
      const result = await apiClient.post(`/levels/${id}/submit`, { code, language: activeLangId });

      setEvalResult(result);

      if (result.passed) {
        setChallengeDone(true);
        if (result.xp_earned > 0) {
          toast.success(`Passed! +${result.xp_earned} XP`);
        } else {
          toast.success("Passed! (XP already claimed)");
        }
        qc.invalidateQueries({ queryKey: ["me"] });
      } else {
        toast.error(`❌ ${result.feedback}`);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Evaluation failed";
      toast.error(msg);
    } finally {
      setEvaluating(false);
    }
  };

  const finishLevel = async () => {
    if (completed) return nav(-1);
    await apiClient.patch("/users/me", {
      completed_levels: [...(me?.completed_levels || []), level.id],
      xp: (me?.xp || 0) + level.xp_reward,
    });
    await apiClient.post("/feed", {
      kind: "level_up",
      title: `Completed: ${level.title}`,
      detail: level.summary,
      xp_gained: level.xp_reward,
    });
    toast.success(`Level complete! +${level.xp_reward} XP`);
    qc.invalidateQueries({ queryKey: ["me"] });
    nav(-1);
  };

  const STEPS = [
    { id: "lesson",    label: "Video",     icon: Play         },
    { id: "reading",   label: "Reading",   icon: BookOpen     },
    { id: "quiz",      label: "Quiz",      icon: HelpCircle   },
    { id: "challenge", label: "Challenge", icon: Code2        },
    { id: "done",      label: "Finish",    icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => nav(-1)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to track
      </button>

      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {level.tier} · {level.track_slug}
        </div>
        <h1 className="font-display text-3xl md:text-5xl mt-1">{level.title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{level.summary}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const active = step === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { setStep(s.id); if (s.id === "challenge") initCode(); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all
                ${active
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary"
                  : "glass hover:bg-secondary/60"}`}
            >
              <Icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >

          {step === "lesson" && (
            <GlassCard className="p-5 md:p-6 space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe src={level.video_url} title={level.title} allowFullScreen className="w-full h-full" />
              </div>
              <Button
                onClick={completeLesson}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                <Sparkles className="w-4 h-4 mr-1" /> Mark as watched (+10 XP)
              </Button>
            </GlassCard>
          )}

          {step === "reading" && (
            <GlassCard className="p-5 md:p-8">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{level.reading_material}</ReactMarkdown>
              </div>
              <Button
                onClick={() => setStep("quiz")}
                className="mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                Continue to quiz →
              </Button>
            </GlassCard>
          )}

          {step === "quiz" && (
            <GlassCard className="p-5 md:p-8 space-y-5">
              {level.quiz?.map((q, i) => (
                <div key={i} className="space-y-2">
                  <div className="font-medium">Q{i + 1}. {q.q}</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => {
                      const selected = quizAnswers[i] === oi;
                      const correct  = quizDone && oi === q.correct_index;
                      const wrong    = quizDone && selected && oi !== q.correct_index;
                      return (
                        <button
                          key={oi}
                          disabled={quizDone}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [i]: oi })}
                          className={`text-left px-4 py-3 rounded-xl text-sm transition-all border
                            ${correct  ? "bg-xp/20 border-xp" :
                              wrong    ? "bg-destructive/20 border-destructive" :
                              selected ? "bg-primary/20 border-primary" :
                                         "glass hover:bg-secondary/50"}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!quizDone ? (
                <Button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length !== level.quiz?.length}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                >
                  Submit quiz
                </Button>
              ) : (
                <Button
                  onClick={() => { setStep("challenge"); initCode(); }}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                >
                  Next: coding challenge →
                </Button>
              )}
            </GlassCard>
          )}

          {step === "challenge" && (
            <div className="space-y-4">
              <GlassCard className="p-5 md:p-6">
                <div className="text-xs uppercase tracking-widest text-accent mb-1">Coding Challenge</div>
                <div className="font-display text-xl">{level.challenge_prompt}</div>
              </GlassCard>

              <GlassCard className="p-0 overflow-hidden">

                {(level.sample_input || level.sample_output) && (
                  <div className="flex gap-4 px-4 py-3 border-b border-border/40 bg-secondary/20">
                    {level.sample_input && (
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Input</div>
                        <pre className="text-xs font-mono text-foreground bg-black/30 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap">{level.sample_input}</pre>
                      </div>
                    )}
                    {level.sample_output && (
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Expected Output</div>
                        <pre className="text-xs font-mono text-foreground bg-black/30 rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap">{level.sample_output}</pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 px-3 pt-2 border-b border-border/60 overflow-x-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageSwitch(lang.id)}
                      className={`px-3 py-1.5 text-xs font-mono rounded-t transition-colors whitespace-nowrap ${
                        activeLangId === lang.id
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

                <div className="flex items-center px-4 py-1.5 border-b border-border/40 bg-secondary/30">
                  <div className="text-xs font-mono text-muted-foreground">{activeLang.filename}</div>
                </div>

                <Textarea
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setEvalResult(null); }}
                  className="font-mono min-h-[280px] bg-transparent border-0 rounded-none focus-visible:ring-0"
                  placeholder="Write your solution here…"
                  spellCheck={false}
                />
              </GlassCard>

              {evalResult && (
                <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm ${
                  evalResult.passed
                    ? "bg-xp/10 border border-xp/30 text-xp"
                    : "bg-destructive/10 border border-destructive/30 text-destructive"
                }`}>
                  {evalResult.passed
                    ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                  <span>{evalResult.feedback}</span>
                </div>
              )}

              {evalResult?.testCases?.length > 0 && (
                <GlassCard className="p-4 space-y-2">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Test Cases</div>
                  {evalResult.testCases.map((tc, i) => (
                    <div
                      key={i}
                      className={`rounded-lg px-3 py-2 text-xs font-mono border ${
                        tc.passed
                          ? "bg-xp/5 border-xp/20 text-xp"
                          : "bg-destructive/5 border-destructive/20 text-destructive"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {tc.passed
                          ? <CheckCircle2 className="w-3 h-3 shrink-0" />
                          : <AlertTriangle className="w-3 h-3 shrink-0" />}
                        <span className="font-semibold">Test {i + 1}</span>
                      </div>
                      <div className="text-muted-foreground">Input: <span className="text-foreground">{tc.input}</span></div>
                      <div className="text-muted-foreground">Expected: <span className="text-foreground">{tc.expectedOutput}</span></div>
                      <div className="text-muted-foreground">Got: <span className="text-foreground">{tc.actualOutput}</span></div>
                    </div>
                  ))}
                </GlassCard>
              )}

              <div className="flex flex-wrap gap-3">
                {!challengeDone ? (
                  <Button
                    onClick={submitChallenge}
                    disabled={evaluating}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary"
                  >
                    {evaluating
                      ? "Evaluating…"
                      : alreadySolvedChallenge
                        ? "Submit solution"
                        : "Submit solution (+50 XP)"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStep("done")}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary"
                  >
                    Finalize level →
                  </Button>
                )}
                <Button variant="outline" onClick={resetCode} className="bg-transparent">
                  Reset code
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <GlassCard className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center glow-primary">
                <CheckCircle2 className="w-8 h-8 text-background" />
              </div>
              <div className="font-display text-3xl">Level cleared!</div>
              <p className="text-muted-foreground">
                You're about to earn{" "}
                <span className="text-gold font-display">+{level.xp_reward} XP</span>{" "}
                for completing this level.
              </p>
              <Button
                onClick={finishLevel}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                Claim reward
              </Button>
            </GlassCard>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
