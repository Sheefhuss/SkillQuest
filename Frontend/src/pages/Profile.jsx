import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { useAuth } from '@/lib/AuthContext';
import { motion } from "framer-motion";
import { Edit3, Flame, Trophy, Code2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/game/GlassCard";
import XpProgressBar from "@/components/game/XpProgressBar";
import TierBadge from "@/components/game/TierBadge";
import BadgeChip from "@/components/game/BadgeChip";
import { BADGES, getTierFromXp } from "@/lib/game";

export default function Profile() {
  const qc = useQueryClient();
  const { deleteAccount } = useAuth();
  
  const { data: me } = useQuery({ 
    queryKey: ["me"], 
    queryFn: () => apiClient.get('/auth/me') 
  });
  
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  if (!me) return null;
  const xp = me.xp || 0;
  const tier = getTierFromXp(xp);
  const activity = new Set(me.activity_log || []);

  const save = async () => {
    await apiClient.patch('/auth/me', form);
    qc.invalidateQueries({ queryKey: ["me"] });
    setEditing(false);
  };

  const days = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today); 
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ key, active: activity.has(key) });
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 md:p-8 relative overflow-hidden neon-border">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[120px]" style={{ background: tier.color + "55" }} />
        <div className="relative flex flex-col md:flex-row gap-6">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center text-2xl font-display font-bold shrink-0 glow-primary">
            {(me.display_name || me.username || "U").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <Input defaultValue={me.display_name || me.username} onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="text-2xl font-display bg-secondary/40 border-border" />
                <Textarea defaultValue={me.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell the community about yourself…" className="bg-secondary/40 min-h-[80px] border-border" />
                <div className="flex gap-2">
                  <Button onClick={save} className="bg-gradient-to-r from-primary to-accent text-primary-foreground"><Save className="w-4 h-4 mr-1" />Save</Button>
                  <Button onClick={() => setEditing(false)} variant="outline" className="bg-transparent border-border"><X className="w-4 h-4" /></Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-display text-3xl md:text-4xl">{me.display_name || me.username}</h1>
                  <TierBadge xp={xp} />
                </div>
                {me.bio && <p className="text-sm mt-3 max-w-xl">{me.bio}</p>}
                <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="mt-3 bg-transparent border-border">
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit profile
                </Button>
              </>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Trophy} label="Total XP" value={xp.toLocaleString()} color="hsl(265 95% 66%)" />
        <Stat icon={Flame} label="Streak" value={me.streak_days || 0} color="hsl(45 100% 60%)" />
        <Stat icon={Code2} label="Solved" value={me.problems_solved || 0} color="hsl(185 100% 55%)" />
        <Stat icon={Trophy} label="Badges" value={(me.badges || []).length} color="hsl(350 95% 62%)" />
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Tier progress</h2>
        </div>
        <XpProgressBar xp={xp} />
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="font-display text-xl mb-4">Activity · last 12 weeks</h2>
        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
          {days.map((d) => (
            <div key={d.key} className="w-3 h-3 rounded-sm"
              style={{ background: d.active ? "hsl(152 80% 55%)" : "hsl(240 15% 14%)" }}
              title={d.key} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="font-display text-xl mb-4">Badges</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {Object.keys(BADGES).map((id) => {
            const earned = (me.badges || []).includes(id);
            return (
              <div key={id} className={earned ? "" : "opacity-30 grayscale"}>
                <BadgeChip id={id} size="md" />
              </div>
            );
          })}
        </div>
      </GlassCard>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard className="p-6 border-red-500/20 mt-10">
          <h2 className="font-display text-xl text-red-400 mb-2">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your account is permanent. Your XP, badges, and all progress will be erased from the Postgres database.
          </p>
          <Button 
            variant="outline" 
            onClick={() => { if(window.confirm("Are you 100% sure? This cannot be undone.")) deleteAccount(); }}
            className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
          >
            Delete My Account
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="glass rounded-2xl p-4"
      style={{ boxShadow: `0 0 0 1px ${color}22` }}>
      <Icon className="w-4 h-4 mb-2" style={{ color }} />
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}