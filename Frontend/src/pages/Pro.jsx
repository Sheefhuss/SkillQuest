import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import {
  Crown, Check, Sparkles, Loader2, ArrowDownCircle,
  CreditCard, Lock, X, BadgeCheck, FlaskConical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GlassCard from "@/components/game/GlassCard";

const FREE_FEATURES = [
  "2 learning tracks",
  "Daily coding challenge",
  "Global leaderboard",
  "AI tutor (10/day)",
];

const PRO_FEATURES = [
  "All 6 tracks unlocked",
  "AI personalised weekly missions",
  "AI mock tests (15-Q timed)",
  "Peer challenges & duels",
  "Unlimited AI tutor",
  "Exclusive Legend badges",
];
function CheckoutModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("form");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [errors, setErrors] = useState({});

  const formatCardNumber = (val) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val) =>
    val.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");

  const handleChange = (field, raw) => {
    let val = raw;
    if (field === "number") val = formatCardNumber(raw);
    if (field === "expiry") val = formatExpiry(raw);
    if (field === "cvc") val = raw.replace(/\D/g, "").slice(0, 3);
    setCard((c) => ({ ...c, [field]: val }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (card.number.replace(/\s/g, "").length < 16) e.number = "Enter a valid 16-digit card number";
    if (card.expiry.length < 5) e.expiry = "Enter a valid expiry (MM/YY)";
    if (card.cvc.length < 3) e.cvc = "Enter a valid CVC";
    if (!card.name.trim()) e.name = "Enter the cardholder name";
    return e;
  };

  const handlePay = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep("processing");
    setTimeout(() => setStep("success"), 2200);
  };

  const inputClass = (field) =>
    `w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:ring-2 focus:ring-gold/50 focus:border-gold/60 ${
      errors[field] ? "border-destructive/70" : "border-white/10"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={step === "form" ? onClose : undefined}
      />
      <div className="relative w-full max-w-md bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Sandbox banner */}
        <div className="flex items-center justify-center gap-2 bg-amber-500/15 border-b border-amber-500/20 py-2 px-4">
          <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium tracking-wide">
            SANDBOX MODE — No real charge will be made
          </span>
        </div>

        {step === "form" && (
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Upgrade to Pro</h2>
                <p className="text-sm text-muted-foreground mt-0.5">$9 / month · Cancel anytime</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mini feature list */}
            <div className="bg-gold/8 border border-gold/20 rounded-xl p-4 space-y-1.5">
              {PRO_FEATURES.slice(0, 3).map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" /> {f}
                </div>
              ))}
              <div className="text-xs text-gold/70 mt-1">+ {PRO_FEATURES.length - 3} more features</div>
            </div>

            {/* Card inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Cardholder Name</label>
                <input
                  className={inputClass("name")}
                  placeholder="Jane Smith"
                  value={card.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Card Number</label>
                <div className="relative">
                  <input
                    className={inputClass("number") + " pr-10"}
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) => handleChange("number", e.target.value)}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                </div>
                {errors.number && <p className="text-xs text-destructive mt-1">{errors.number}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Expiry</label>
                  <input
                    className={inputClass("expiry")}
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => handleChange("expiry", e.target.value)}
                  />
                  {errors.expiry && <p className="text-xs text-destructive mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">CVC</label>
                  <input
                    className={inputClass("cvc")}
                    placeholder="123"
                    value={card.cvc}
                    onChange={(e) => handleChange("cvc", e.target.value)}
                  />
                  {errors.cvc && <p className="text-xs text-destructive mt-1">{errors.cvc}</p>}
                </div>
              </div>
            </div>

            <Button
              onClick={handlePay}
              className="w-full bg-gradient-to-r from-gold to-destructive text-background font-bold py-5 glow-gold"
            >
              <Lock className="w-3.5 h-3.5 mr-2" />
              Activate Pro — $9/mo (Sandbox)
            </Button>

            <p className="text-center text-xs text-muted-foreground/50 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" /> Simulated secure checkout · No real payment
            </p>
          </div>
        )}

        {step === "processing" && (
          <div className="p-14 flex flex-col items-center gap-5 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
              <CreditCard className="w-6 h-6 text-gold absolute inset-0 m-auto" />
            </div>
            <div>
              <p className="font-semibold">Processing payment…</p>
              <p className="text-sm text-muted-foreground mt-1">Please wait a moment</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="p-10 flex flex-col items-center gap-5 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
                <BadgeCheck className="w-10 h-10 text-gold" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-gold/40 animate-ping" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to Pro! 👑</h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                All features are now unlocked. Enjoy every track, AI missions, and more.
              </p>
            </div>
            <Button
              onClick={onSuccess}
              className="bg-gradient-to-r from-gold to-destructive text-background font-semibold w-full glow-gold"
            >
              Start Exploring
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Pro() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [loadingDowngrade, setLoadingDowngrade] = useState(false);

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.get("/users/me"),
  });

  const isPro = me?.is_pro ?? false;

  const handlePaymentSuccess = async () => {
    setShowModal(false);
    await apiClient.patch("/users/me", { is_pro: true });
    qc.invalidateQueries({ queryKey: ["me"] });
    toast.success("You're now Pro! 👑");
  };

  const handleDowngrade = async () => {
    if (!window.confirm("Downgrade to Free? You'll lose Pro features immediately.")) return;
    setLoadingDowngrade(true);
    try {
      await apiClient.patch("/users/me", { is_pro: false });
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast("Reverted to Free plan.");
    } catch {
      toast.error("Could not downgrade. Please try again.");
    } finally {
      setLoadingDowngrade(false);
    }
  };

  return (
    <>
      {showModal && (
        <CheckoutModal
          onClose={() => setShowModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="space-y-6">
        <div className="text-center">
          <Crown className="w-10 h-10 mx-auto text-gold" />
          <h1 className="font-display text-4xl md:text-5xl mt-2">
            Go <span className="text-gradient">Pro</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Unlock AI missions, mock tests, peer duels & every track.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">

          {/* FREE CARD */}
          <GlassCard className={`p-6 relative transition-all duration-300 ${!isPro ? "ring-2 ring-primary/40" : "opacity-70"}`}>
            {!isPro && (
              <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                Current Plan
              </span>
            )}
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Free</div>
            <div className="font-display text-4xl mt-1">$0</div>
            <div className="text-sm text-muted-foreground">Forever</div>
            <ul className="mt-5 space-y-2 text-sm">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button
                onClick={handleDowngrade}
                disabled={loadingDowngrade}
                variant="outline"
                className="mt-6 w-full bg-transparent border-muted-foreground/30 text-muted-foreground hover:text-foreground"
              >
                {loadingDowngrade
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Downgrading…</>
                  : <><ArrowDownCircle className="w-4 h-4 mr-2" />Downgrade to Free</>
                }
              </Button>
            ) : (
              <div className="mt-6 text-center text-sm text-muted-foreground py-2 border border-white/5 rounded-lg">
                ✓ You're on this plan
              </div>
            )}
          </GlassCard>

          {/* This is the PRO CARD */}
          <GlassCard className={`p-6 neon-border relative overflow-hidden transition-all duration-300 ${isPro ? "ring-2 ring-gold/60" : ""}`}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/30 blur-3xl pointer-events-none" />
            {isPro && (
              <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest bg-gold/20 text-gold px-2 py-0.5 rounded-full font-semibold">
                Current Plan
              </span>
            )}
            <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
                <Sparkles className="w-3 h-3" /> Pro
              </div>
              <div className="font-display text-4xl mt-1">
                $9<span className="text-lg text-muted-foreground">/mo</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                Cancel anytime
                <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  <FlaskConical className="w-2.5 h-2.5" /> Sandbox
                </span>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {isPro ? (
                <div className="mt-6 flex items-center gap-2 text-sm text-gold font-medium">
                  <Crown className="w-4 h-4" /> You're Pro! Enjoy all features.
                </div>
              ) : (
                <Button
                  onClick={() => setShowModal(true)}
                  disabled={meLoading}
                  className="mt-6 w-full bg-gradient-to-r from-gold to-destructive text-background glow-gold font-semibold"
                >
                  Upgrade to Pro — $9/mo
                </Button>
              )}
            </div>
          </GlassCard>
        </div>

        {!isPro && (
          <p className="text-center text-xs text-muted-foreground">
            <Lock className="inline w-3 h-3 mr-1 mb-0.5" />
            Sandbox checkout · No real payment processed
          </p>
        )}
      </div>
    </>
  );
}