import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Play, CheckCircle2, BookOpen, Code2, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import GlassCard from "@/components/game/GlassCard";
import { BADGES } from "@/lib/game";

export default function LevelDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => apiClient.get("/users/me") });
  const { data: level } = useQuery({
    queryKey: ["level", id], queryFn: () => apiClient.get(`/levels/${id}`),
  });

  const [step, setStep] = useState("lesson"); // lesson | reading | quiz | challenge | done
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizDone, setQuizDone] = useState(false);
  const [code, setCode] = useState("");
  const [challengeDone, setChallengeDone] = useState(false);

  if (!level) return <div className="text-muted-foreground">Loading…</div>;
  const completed = (me?.completed_levels || []).includes(level.id);

  const awardXP = async (amount, activity) => {
    await apiClient.patch("/users/me", { xp: (me?.xp || 0) + amount });
    toast.success(`+${amount} XP — ${activity}`);
    qc.invalidateQueries({ queryKey: ["me"] });
  };

  const submitQuiz = async () => {
    const score = level.quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.correct_index ? 1 : 0), 0);
    setQuizDone(true);
    await awardXP(20, "Quiz completed");
    toast.success(`You scored ${score}/${level.quiz.length}`);
  };

  const completeLesson = async () => {
    if (!(me?.badges || []).includes("first_lesson")) {
      await apiClient.patch("/users/me", { badges: [...(me?.badges || []), "first_lesson"] });
      toast.success(`🏅 Badge earned: ${BADGES.first_lesson.name}`);
    }
    await awardXP(10, "Lesson watched");
    setStep("reading");
  };

  const completeChallenge = async () => {
    if (!code.trim()) return toast.error("Write something first!");
    setChallengeDone(true);
    await awardXP(50, "Coding challenge solved");
    await apiClient.patch("/users/me", {
      problems_solved: (me?.problems_solved || 0) + 1,
    });
    qc.invalidateQueries({ queryKey: ["me"] });
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
    { id: "lesson", label: "Video", icon: Play },
    { id: "reading", label: "Reading", icon: BookOpen },
    { id: "quiz", label: "Quiz", icon: HelpCircle },
    { id: "challenge", label: "Challenge", icon: Code2 },
    { id: "done", label: "Finish", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to track
      </button>

      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{level.tier} · {level.track_slug}</div>
        <h1 className="font-display text-3xl md:text-5xl mt-1">{level.title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{level.summary}</p>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const active = step === s.id;
          return (
            <button key={s.id} onClick={() => setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all
                ${active ? "bg-gradient-to-r from-primary to-accent text-primary-foreground glow-primary" : "glass hover:bg-secondary/60"}`}>
              <Icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        >
          {step === "lesson" && (
            <GlassCard className="p-5 md:p-6 space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe src={level.video_url} title={level.title} allowFullScreen className="w-full h-full" />
              </div>
              <Button onClick={completeLesson} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Sparkles className="w-4 h-4 mr-1" /> Mark as watched (+10 XP)
              </Button>
            </GlassCard>
          )}

          {step === "reading" && (
            <GlassCard className="p-5 md:p-8">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{level.reading_material}</ReactMarkdown>
              </div>
              <Button onClick={() => setStep("quiz")} className="mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">Continue to quiz →</Button>
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
                      const correct = quizDone && oi === q.correct_index;
                      const wrong = quizDone && selected && oi !== q.correct_index;
                      return (
                        <button
                          key={oi}
                          disabled={quizDone}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [i]: oi })}
                          className={`text-left px-4 py-3 rounded-xl text-sm transition-all
                            ${correct ? "bg-xp/20 border-xp" :
                              wrong ? "bg-destructive/20 border-destructive" :
                              selected ? "bg-primary/20 border-primary" : "glass hover:bg-secondary/50"}
                            border`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!quizDone ? (
                <Button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length !== level.quiz.length}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground">Submit quiz</Button>
              ) : (
                <Button onClick={() => setStep("challenge")} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">Next: coding challenge →</Button>
              )}
            </GlassCard>
          )}

          {step === "challenge" && (
            <GlassCard className="p-5 md:p-8 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-accent">Coding Challenge</div>
                <div className="font-display text-xl mt-1">{level.challenge_prompt}</div>
              </div>
              <Textarea value={code || level.challenge_starter || ""} onChange={(e) => setCode(e.target.value)}
                className="font-mono min-h-[220px] bg-background/60" placeholder="Write your solution here..." />
              {!challengeDone ? (
                <Button onClick={completeChallenge} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  Submit solution (+50 XP)
                </Button>
              ) : (
                <Button onClick={() => setStep("done")} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">Finalize level →</Button>
              )}
            </GlassCard>
          )}

          {step === "done" && (
            <GlassCard className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center glow-primary">
                <CheckCircle2 className="w-8 h-8 text-background" />
              </div>
              <div className="font-display text-3xl">Level cleared!</div>
              <p className="text-muted-foreground">You're about to earn <span className="text-gold font-display">+{level.xp_reward} XP</span> for completing this level.</p>
              <Button onClick={finishLevel} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Claim reward
              </Button>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}