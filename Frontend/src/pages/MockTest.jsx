import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Crown, CheckCircle2, XCircle, Lock, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import GlassCard from "@/components/game/GlassCard";
import { usePlanLimits } from "@/lib/usePlanLimits";
import { Link } from "react-router-dom";

const TRACKS = [
  { slug: "fullstack", title: "Full Stack Web Development" },
  { slug: "webdev", title: "Web Development" },
  { slug: "dsa", title: "DSA & Algorithms" },
  { slug: "systemdesign", title: "System Design" },
  { slug: "databases", title: "Databases" },
  { slug: "devops", title: "DevOps" },
  { slug: "apis", title: "APIs & Integrations" },
];

export default function MockTest() {
  const { isPro, canAccessMockTest } = usePlanLimits();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => apiClient.get("/users/me") });
  const { data: apiTracks = [] } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => apiClient.get("/tracks"),
    onError: () => {},
  });
  const tracks = apiTracks.length > 0 ? apiTracks : TRACKS;

  const [trackSlug, setTrackSlug] = useState("");
  const [tier, setTier] = useState("Beginner");
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState("setup");
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (phase !== "test") return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [phase, startTime]);

  const adjustCount = (delta) => {
    setQuestionCount((prev) => Math.min(10, Math.max(3, prev + delta)));
  };

  const generate = async () => {
    if (!canAccessMockTest) return toast.error("AI Mock Test is a Pro feature.");
    if (!trackSlug) return toast.error("Pick a track first.");
    setGenerating(true);
    try {
      const res = await apiClient.post("/ai/mocktest", { trackSlug, tier, questionCount });
      setQuestions(res.questions || []);
      setAnswers({});
      setStartTime(Date.now());
      setElapsed(0);
      setPhase("test");
    } catch (err) {
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const finish = async () => {
    let correct = 0;
    const graded = questions.map((q, i) => {
      const ua = (answers[i] || "").toString().trim().toLowerCase();
      const ca = (q.answer || "").toString().trim().toLowerCase();
      const ok = ua === ca;
      if (ok) correct++;
      return { ...q, user_answer: answers[i] || "", is_correct: ok };
    });
    setQuestions(graded);
    setScore(correct);
    setPhase("done");
    try {
      await apiClient.post("/mocktests", {
        track_slug: trackSlug, tier,
        questions: graded, score: correct, total: questions.length, time_seconds: elapsed,
      });
      await apiClient.patch("/users/me", { xp: (me?.xp || 0) + correct * 10 });
    } catch (_) {}
    toast.success(`Scored ${correct}/${questions.length} · +${correct * 10} XP`);
  };

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI-generated</div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">Mock <span className="text-gradient">Test</span></h1>
          <p className="text-muted-foreground mt-2">Custom questions. Instant feedback. Real XP.</p>
        </div>
        <GlassCard className="p-10 text-center space-y-4 neon-border">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/10 border border-gold/30 grid place-items-center">
            <Lock className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h2 className="font-display text-2xl">Pro feature</h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
              AI mock tests are exclusive to Pro. Get timed, AI-generated MCQ questions matched to your chosen track and difficulty.
            </p>
          </div>
          <div className="text-left max-w-xs mx-auto space-y-2 text-sm text-muted-foreground">
            {["5–30 questions per test", "MCQ with instant grading", "Real XP rewards", "All 7 tracks available"].map((f) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI-generated</div>
        <h1 className="font-display text-4xl md:text-5xl mt-1">Mock <span className="text-gradient">Test</span></h1>
        <p className="text-muted-foreground mt-2">Custom questions. Instant feedback. Real XP.</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── SETUP ── */}
        {phase === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Track selector */}
                <Select value={trackSlug} onValueChange={setTrackSlug}>
                  <SelectTrigger><SelectValue placeholder="Pick a track" /></SelectTrigger>
                  <SelectContent>
                    {tracks.map((t) => (
                      <SelectItem key={t.slug} value={t.slug}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Difficulty selector */}
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question count picker */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Number of questions</span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => adjustCount(-5)}
                    disabled={questionCount <= 3}
                    className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 disabled:opacity-30 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-display text-xl tabular-nums">{questionCount}</span>
                  <button
                    onClick={() => adjustCount(5)}
                    disabled={questionCount >= 10}
                    className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 disabled:opacity-30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">(3–10)</span>
              </div>

              <Button
                onClick={generate}
                disabled={generating}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                {generating
                  ? "Generating…"
                  : <><Sparkles className="w-4 h-4 mr-1" /> Start mock test</>}
              </Button>
            </GlassCard>
          </motion.div>
        )}

        {/* ── TEST ── */}
        {phase === "test" && (
          <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
              <div className="text-sm text-muted-foreground">
                {Object.keys(answers).length}/{questions.length} answered
              </div>
              <div className="flex items-center gap-1 text-accent text-sm font-mono">
                <Clock className="w-4 h-4" /> {minutes}:{seconds}
              </div>
            </div>

            {questions.map((q, i) => (
              <GlassCard key={i} className="p-5 space-y-3">
                <div className="text-xs text-muted-foreground uppercase tracking-widest">
                  Q{i + 1} · MCQ
                </div>
                <div className="font-medium leading-snug">{q.q}</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {q.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, [i]: opt })}
                      className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-all
                        ${answers[i] === opt
                          ? "bg-primary/20 border-primary text-foreground"
                          : "glass hover:bg-secondary/50 border-white/10 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </GlassCard>
            ))}

            <Button
              onClick={finish}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-full md:w-auto"
            >
              Submit test
            </Button>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <GlassCard className="p-8 text-center neon-border">
              <div className="font-display text-6xl tabular-nums">{score}/{questions.length}</div>
              <div className="text-sm text-muted-foreground mt-2">
                Completed in {minutes}:{seconds} · +{score * 10} XP earned
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {score === questions.length
                  ? "🎉 Perfect score!"
                  : score >= questions.length * 0.8
                  ? "🔥 Great job!"
                  : score >= questions.length * 0.5
                  ? "👍 Keep it up!"
                  : "💪 Keep practising!"}
              </div>
              <Button
                onClick={() => { setPhase("setup"); setQuestions([]); setAnswers({}); }}
                className="mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                Take another
              </Button>
            </GlassCard>

            {questions.map((q, i) => (
              <GlassCard key={i} className="p-5">
                <div className="flex items-start gap-3">
                  {q.is_correct
                    ? <CheckCircle2 className="w-5 h-5 text-xp mt-0.5 shrink-0" />
                    : <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />}
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{q.q}</div>
                    <div className="text-xs text-muted-foreground">Your answer: {q.user_answer || "—"}</div>
                    <div className="text-xs text-xp">Correct: {q.answer}</div>
                    {q.explanation && (
                      <div className="text-sm text-muted-foreground mt-2 pt-2 border-t border-white/5">
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}