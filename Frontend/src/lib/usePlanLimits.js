
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { toast } from "sonner";

export const FREE_LIMITS = {
  aiTutorPerDay: 10,
  tracks: 2,  
  missions: false,     
  mockTest: false,    
  peerDuels: false,    
};

export function usePlanLimits() {
  const qc = useQueryClient();
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get("/users/me"),
  });

  const isPro = me?.is_pro ?? false;

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = me?.ai_tutor_date === todayStr;
  const tutorUsesToday = isToday ? (me?.ai_tutor_uses_today ?? 0) : 0;
  const tutorRemaining = isPro ? Infinity : Math.max(0, FREE_LIMITS.aiTutorPerDay - tutorUsesToday);
  const tutorExhausted = !isPro && tutorRemaining === 0;

  const consumeTutorUse = async () => {
    if (isPro) return true;
    if (tutorExhausted) {
      toast.error("You've used all 10 AI tutor messages for today. Upgrade to Pro for unlimited access.", {
        action: { label: "Go Pro", onClick: () => (window.location.href = "/pro") },
      });
      return false; 
    }

    const newCount = tutorUsesToday + 1;
    await apiClient.patch("/users/me", {
      ai_tutor_uses_today: newCount,
      ai_tutor_date: todayStr,
    });
    qc.invalidateQueries({ queryKey: ["me"] });

    if (newCount === 8) toast.warning("2 AI tutor messages left today.");
    if (newCount === 9) toast.warning("Last AI tutor message for today!");

    return true;
  };

  const canAccessMissions = isPro;
  const canAccessMockTest = isPro;
  const canAccessPeerDuels = isPro;

  const canAccessTrack = (track) => isPro || track.is_free;

  const requirePro = (featureName) => {
    if (isPro) return true;
    toast.error(`${featureName} is a Pro feature.`, {
      action: { label: "Upgrade", onClick: () => (window.location.href = "/pro") },
    });
    return false;
  };

  return {
    isPro,
    me,

    tutorUsesToday,
    tutorRemaining,
    tutorExhausted,
    consumeTutorUse,
    canAccessMissions,
    canAccessMockTest,
    canAccessPeerDuels,
    canAccessTrack,
    requirePro,
    FREE_LIMITS,
  };
}
