
const DEFAULT_USER = {
  email: "player_one@local.dev",
  display_name: "Local Legend",
  full_name: "Player One",
  xp: 0,
  tier: "Rookie",
  problems_solved: 0,
  completed_levels: [],
  badges: [],
  streak_days: 0,
  is_pro: false
};

export const localAuth = {
  me: async () => {
    await new Promise(resolve => setTimeout(resolve, 150)); 
    
    const stored = localStorage.getItem("sq_user");
    if (!stored) {
      localStorage.setItem("sq_user", JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(stored);
  },

  updateMe: async (updates) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const current = await localAuth.me();
    const updatedUser = { ...current, ...updates };
    
    localStorage.setItem("sq_user", JSON.stringify(updatedUser));
    return updatedUser;
  },
  redirectToLogin: (redirectUrl) => {
    if (!localStorage.getItem("sq_user")) {
      localStorage.setItem("sq_user", JSON.stringify(DEFAULT_USER));
    }
    window.location.href = redirectUrl || "/dashboard";
  }
};