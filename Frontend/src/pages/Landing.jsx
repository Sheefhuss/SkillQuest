import React, { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "@/components/auth/AuthModal";
import { motion } from "framer-motion";
import {
  Flame, Zap, Trophy, Target, Bot, Sparkles, ArrowRight, Swords,
  Code2, Users, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => setIsAuthOpen(true);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* animated grid + glows */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[140px] animate-float" />
      <div className="absolute top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-gold/20 blur-[120px] animate-float" style={{ animationDelay: "4s" }} />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl grid place-items-center bg-gradient-to-br from-primary via-accent to-gold glow-primary">
            <Flame className="w-5 h-5 text-background" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-xl leading-none">SkillQuest</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Learn. Battle. Level up.</div>
          </div>
        </div>
        <Button onClick={handleLogin} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground glow-primary">
          Enter the Quest <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 pt-10 lg:pt-20 pb-24 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs uppercase tracking-widest">The game that teaches you to code</span>
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight"
        >
          Grind less. <br />
          <span className="text-gradient">Level up</span> more.
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Six curated skill tracks. Daily coding battles. AI-personalised missions.
          An XP system that makes learning feel addictive — in a good way.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" onClick={handleLogin} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground glow-primary text-base px-7 h-12">
            Start free — no card needed <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="h-12 bg-transparent border-border text-base px-7">
              Peek inside
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 relative max-w-4xl mx-auto"
        >
          <div className="glass-strong rounded-3xl p-6 md:p-10 neon-border">
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <StatCard icon={Zap} label="Weekly XP" value="+2,480" color="hsl(265 95% 66%)" />
              <StatCard icon={Flame} label="Streak" value="12 days" color="hsl(45 100% 60%)" />
              <StatCard icon={Trophy} label="Global Rank" value="#342" color="hsl(185 100% 55%)" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 lg:px-12 pb-24 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">How it works</div>
          <h2 className="font-display text-3xl md:text-5xl mt-2">Your skill tree. Gamified.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-6 hover:glow-primary transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl grid place-items-center mb-4"
                style={{ background: `linear-gradient(135deg, ${f.color}44, transparent)`, boxShadow: `0 0 0 1px ${f.color}55` }}>
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <div className="font-display text-xl mb-1">{f.title}</div>
              <div className="text-sm text-muted-foreground">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-12 pb-24 max-w-4xl mx-auto">
        <div className="glass-strong rounded-3xl p-10 md:p-14 text-center relative overflow-hidden neon-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15 pointer-events-none" />
          <Crown className="w-10 h-10 mx-auto text-gold mb-4" />
          <h3 className="font-display text-3xl md:text-5xl">Ready to become a Legend?</h3>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Join thousands of devs leveling up every day. Sign in once — your progress, XP and badges are saved forever.
          </p>
          <Button size="lg" onClick={handleLogin} className="mt-8 bg-gradient-to-r from-primary to-accent text-primary-foreground h-12 px-8 glow-primary">
            Start your quest <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <div className="mt-4 text-xs text-muted-foreground">Instant sign-in · Zero friction · No bots, just code.</div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © SkillQuest — Learn like a game. Ship like a pro.
      </footer>

      {/* Auth Modal — Line 128 */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

const FEATURES = [
  { title: "6 Skill Tracks", desc: "Web Dev, DSA, System Design, Databases, DevOps, APIs.", icon: Code2, color: "hsl(265 95% 66%)" },
  { title: "Daily Battles", desc: "A fresh coding challenge every midnight.", icon: Swords, color: "hsl(185 100% 55%)" },
  { title: "AI Missions", desc: "Personalised weekly quests.", icon: Target, color: "hsl(45 100% 60%)" },
  { title: "AI Tutor", desc: "Stuck on a concept? Our tutor rephrases and simplifies.", icon: Bot, color: "hsl(152 80% 55%)" },
  { title: "Leaderboards", desc: "Global & friend rankings.", icon: Trophy, color: "hsl(350 95% 62%)" },
  { title: "Peer Duels", desc: "Challenge a friend to the same problem.", icon: Users, color: "hsl(185 100% 55%)" },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl grid place-items-center"
        style={{ background: `linear-gradient(135deg, ${color}33, transparent)`, boxShadow: `0 0 0 1px ${color}55` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-display text-2xl">{value}</div>
      </div>
    </div>
  );
}