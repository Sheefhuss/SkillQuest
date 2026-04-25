import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/game/GlassCard";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin]               = useState(true);
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername]             = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [loading, setLoading]               = useState(false);

  const { login, register } = useAuth();

  const switchMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await register(username, email, password);
        toast.success("Account created! Let the quest begin.");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="p-8 neon-border relative overflow-hidden">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-display text-3xl mb-2">
                {isLogin ? "Welcome back" : "Create Account"}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {isLogin
                  ? "Enter your credentials to continue your quest."
                  : "Join the community and start leveling up today."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Username — register only */}
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 bg-secondary/40 border-border"
                        placeholder="codemaster"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-secondary/40 border-border"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-secondary/40 border-border"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password — register only */}
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 bg-secondary/40 border-border ${
                          confirmPassword && confirmPassword !== password
                            ? "border-destructive focus-visible:ring-destructive"
                            : confirmPassword && confirmPassword === password
                            ? "border-xp focus-visible:ring-xp"
                            : ""
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirm
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Live match indicator */}
                    {confirmPassword && (
                      <p className={`text-xs ml-1 mt-1 ${
                        confirmPassword === password ? "text-xp" : "text-destructive"
                      }`}>
                        {confirmPassword === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground h-12 glow-primary mt-4"
                >
                  {loading
                    ? "Please wait…"
                    : isLogin
                    ? "Sign In"
                    : "Register"}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={switchMode}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? Register"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
