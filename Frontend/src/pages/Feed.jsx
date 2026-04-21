import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Award, Code2, Flame, Target, UserPlus, UserMinus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/game/GlassCard";
import { toast } from "sonner";

const KIND_ICONS = {
  badge: Award, level_up: TrendingUp, challenge: Code2, streak: Flame, mission: Target,
};

export default function Feed() {
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => apiClient.get("/users/me") });
  const { data: posts = [] } = useQuery({
    queryKey: ["feed"], queryFn: () => apiClient.get("/feed"),
  });
  const { data: users = [] } = useQuery({
    queryKey: ["allUsers"], queryFn: () => apiClient.get("/users/top?limit=50"),
  });
  const { data: follows = [] } = useQuery({
    enabled: !!me, queryKey: ["myFollows", me?.email],
    queryFn: () => apiClient.get("/follows"),
  });

  const followingSet = new Set(follows.map((f) => f.following_email));

  const toggleFollow = async (email) => {
    if (followingSet.has(email)) {
      const f = follows.find((x) => x.following_email === email);
      await apiClient.delete(`/follows/${f.id}`);
      toast("Unfollowed");
    } else {
      await apiClient.post("/follows", { following_email: email });
      toast.success("Following!");
    }
    qc.invalidateQueries({ queryKey: ["myFollows"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Community</div>
        <h1 className="font-display text-4xl md:text-5xl mt-1">Activity Feed</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {posts.length === 0 && (
            <GlassCard className="p-6 text-center text-muted-foreground text-sm">Be the first to earn XP — the feed will light up soon.</GlassCard>
          )}
          {posts.map((p, i) => {
            const Icon = KIND_ICONS[p.kind] || Award;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-xs font-bold shrink-0">
                    {(p.user_name || p.user_email || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{p.user_name || p.user_email}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(p.created_date || Date.now()), { addSuffix: true })}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-accent" />
                      <div className="font-medium">{p.title}</div>
                    </div>
                    {p.detail && <div className="text-sm text-muted-foreground mt-1">{p.detail}</div>}
                    {p.xp_gained && <div className="text-xs text-gold mt-1">+{p.xp_gained} XP</div>}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-3">
          <GlassCard className="p-5">
            <div className="font-display text-lg mb-3">Discover players</div>
            <div className="space-y-2">
              {users.filter((u) => u.email !== me?.email).slice(0, 8).map((u) => {
                const followed = followingSet.has(u.email);
                return (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-xs font-bold">
                      {(u.display_name || u.full_name || u.email || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{u.display_name || u.full_name || u.email}</div>
                      <div className="text-xs text-muted-foreground">{(u.xp || 0).toLocaleString()} XP</div>
                    </div>
                    <Button size="sm" variant={followed ? "outline" : "default"}
                      onClick={() => toggleFollow(u.email)}
                      className={followed ? "bg-transparent" : "bg-gradient-to-r from-primary to-accent text-primary-foreground"}>
                      {followed ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}