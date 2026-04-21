import React, { useEffect, useState, useRef } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Route as RouteIcon, Swords, Target, Bot, Trophy,
  Users, User as UserIcon, Menu, X, Flame, Sparkles, LogOut
} from "lucide-react";
import XpBadge from "@/components/game/XpBadge";
import StreakPill from "@/components/game/StreakPill";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tracks", label: "Learning Paths", icon: RouteIcon },
  { to: "/daily", label: "Daily Challenge", icon: Swords },
  { to: "/missions", label: "AI Missions", icon: Target },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/mocktest", label: "Mock Test", icon: Sparkles },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/feed", label: "Feed", icon: Users },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const qc = useQueryClient();
  const { logout } = useAuth();
  const hasProcessedStreak = useRef(false);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get('/auth/me'),
  });

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!me || hasProcessedStreak.current) return;

    const today = new Date().toISOString().split("T")[0];
    const activity = me.activity_log || [];

    if (activity.includes(today)) {
      hasProcessedStreak.current = true;
      return;
    }
    
    hasProcessedStreak.current = true; 

    const last = me.last_active_date;
    const isConsecutive = last && (new Date(today) - new Date(last)) / 86400000 === 1;
    const newStreak = isConsecutive ? (me.streak_days || 0) + 1 : 1;
    
    apiClient.patch('/auth/me', {
      activity_log: [...activity, today],
      last_active_date: today,
      streak_days: newStreak,
      xp: (me.xp || 0) + 5,
    }).then(() => {
      qc.invalidateQueries({ queryKey: ["me"] });
    });
  }, [me, qc]);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex flex-col w-64 shrink-0 glass-strong border-r border-border/60 sticky top-0 h-screen p-5">
        <Brand />
        <nav className="mt-8 space-y-1 flex-1">
          {NAV.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-border/60">
          <Button 
            variant="ghost" 
            onClick={logout} 
            className="w-full justify-start text-muted-foreground hover:text-red-400 group mb-2"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
          <UserMini user={me} />
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass-strong border-b border-border/60 flex items-center justify-between px-4 h-14">
        <Brand compact />
        <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-secondary">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/60"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 h-full glass-strong p-5 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <Brand />
                <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-6 space-y-1 flex-1">
                {NAV.map((n) => <NavItem key={n.to} {...n} />)}
              </nav>
              <div className="mt-auto pt-4 border-t border-border/60">
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="w-full justify-start text-muted-foreground hover:text-red-400 group mb-2"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
                <UserMini user={me} />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="hidden lg:flex items-center justify-end gap-3 px-8 h-16 border-b border-border/60 glass">
          <StreakPill days={me?.streak_days || 0} />
          <XpBadge xp={me?.xp || 0} />
        </div>
        <div className="lg:hidden flex items-center justify-end gap-2 px-4 py-2 border-b border-border/60">
          <StreakPill days={me?.streak_days || 0} compact />
          <XpBadge xp={me?.xp || 0} compact />
        </div>
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Brand({ compact = false }) {
  return (
    <NavLink to="/" className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br from-primary via-accent to-gold glow-primary">
        <Flame className="w-5 h-5 text-background" strokeWidth={2.5} />
      </div>
      {!compact && (
        <div>
          <div className="font-display text-xl leading-none">SkillQuest</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Level up.</div>
        </div>
      )}
      {compact && <span className="font-display text-lg">SkillQuest</span>}
    </NavLink>
  );
}

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
         ${isActive
            ? "bg-gradient-to-r from-primary/20 to-accent/10 text-foreground neon-border"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`
      }
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      <AnimatePresence>
        {window.location.pathname === (to === "/" ? "/dashboard" : to) && (
          <motion.div layoutId="nav-glow" className="absolute inset-0 bg-primary/5 rounded-lg -z-10" />
        )}
      </AnimatePresence>
    </NavLink>
  );
}

function UserMini({ user }) {
  if (!user) return <div className="h-10 w-full shimmer rounded-lg" />;
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-xs font-bold shadow-lg">
        {(user.display_name || user.username || user.email || "U").slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{user.display_name || user.username}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{user.level_tier || "Rookie"}</div>
      </div>
    </div>
  );
}