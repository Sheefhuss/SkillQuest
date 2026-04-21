import React, { useState, useRef, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Sparkles, User, Wand2, BookOpen, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/game/GlassCard";
import { usePlanLimits } from "@/lib/usePlanLimits";
import { Link } from "react-router-dom";

const PRESETS = [
  { icon: BookOpen, label: "Explain memoisation with an example", prompt: "Explain memoisation with a clear JS example." },
  { icon: Wand2, label: "Simplify my last lesson", prompt: "Rephrase & simplify the concept of recursion for a beginner." },
  { icon: Flame, label: "Give me a harder Two Sum", prompt: "Give me a harder version of the Two Sum problem with twists, include constraints." },
];

export default function Assistant() {
  const { isPro, tutorRemaining, tutorExhausted, consumeTutorUse } = usePlanLimits();

  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I'm your AI tutor 🤖. Ask me to explain a concept, simplify a lesson, or give you a harder problem." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const allowed = await consumeTutorUse();
    if (!allowed) return;

    setInput("");

    const updatedMessages = [...messages, { role: "user", content: text }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const history = updatedMessages
        .slice(1) 
        .slice(0, -1) 
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await apiClient.post("/ai/chat", { prompt: text, history });
      setMessages((m) => [...m, { role: "assistant", content: response.text || "I'm sorry,I couldn't process this at a moment.Please try next time" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "AI backend is offline. Please try again." }]);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-5 h-[calc(100vh-160px)] flex flex-col">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI tutor</div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">Ask <span className="text-gradient">anything</span>.</h1>
        </div>

        {!isPro && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            tutorExhausted
              ? "bg-destructive/10 border-destructive/40 text-destructive"
              : tutorRemaining <= 3
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-secondary border-border text-muted-foreground"
          }`}>
            <Zap className="w-3.5 h-3.5" />
            {tutorExhausted ? (
              <>Limit reached · <Link to="/pro" className="underline ml-1">Go Pro</Link></>
            ) : (
              <>{tutorRemaining} message{tutorRemaining !== 1 ? "s" : ""} left today</>
            )}
          </div>
        )}
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center shrink-0 glow-primary">
                    <Bot className="w-4 h-4 text-background" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm
                  ${m.role === "user" ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "glass"}`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-secondary grid place-items-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-2 items-center text-muted-foreground text-sm">
              <Sparkles className="w-4 h-4 animate-pulse" /> Thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        {tutorExhausted && (
          <div className="mx-4 mb-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm flex items-center justify-between gap-3">
            <span className="text-destructive">You've used all 10 free messages for today.</span>
            <Link to="/pro">
              <Button size="sm" className="bg-gradient-to-r from-gold to-destructive text-background shrink-0">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        )}

        <div className="border-t border-border/60 p-3 space-y-3">
          <div className="flex gap-2 overflow-x-auto">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => send(p.prompt)}
                disabled={tutorExhausted}
                className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs hover:bg-secondary/60 disabled:opacity-40 disabled:cursor-not-allowed">
                <p.icon className="w-3.5 h-3.5 text-accent" /> {p.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={tutorExhausted}
              placeholder={tutorExhausted ? "Daily limit reached — upgrade to Pro" : "Ask anything — 'Explain big-O with examples'"}
              className="bg-secondary/50 border-border disabled:opacity-50"
            />
            <Button
              onClick={() => send()}
              disabled={loading || !input.trim() || tutorExhausted}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}