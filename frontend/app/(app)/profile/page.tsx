"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Target, CreditCard, Check, Loader2, ChevronRight, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "goals", label: "Goals & Body", icon: Target },
  { id: "subscription", label: "Subscription", icon: CreditCard },
];

const DIET_OPTIONS = [
  { value: "keto", label: "Keto", desc: "70% fat, 25% protein, 5% carbs" },
  { value: "carnivore", label: "Carnivore", desc: "Animal products only" },
  { value: "ketovore", label: "Ketovore", desc: "Mostly carnivore with some plants" },
];

const GOAL_OPTIONS = [
  { value: "fat_loss", label: "Fat Loss" },
  { value: "maintenance", label: "Maintenance" },
  { value: "muscle_gain", label: "Muscle Gain" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "light", label: "Light", desc: "1–3 days/week" },
  { value: "moderate", label: "Moderate", desc: "3–5 days/week" },
  { value: "active", label: "Active", desc: "6–7 days/week" },
  { value: "very_active", label: "Very Active", desc: "Twice/day" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        background: "var(--bg)",
        border: "1.5px solid var(--border)",
        color: "var(--text)",
      }}
    />
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState("account");
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Account fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [accountError, setAccountError] = useState("");

  // Goals fields
  const [dietType, setDietType] = useState("");
  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [gender, setGender] = useState("");
  const [weeklyBudget, setWeeklyBudget] = useState("");
  const [newMacros, setNewMacros] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profileRes, subRes] = await Promise.all([
        api.get("/users/profile"),
        api.get("/payments/subscription"),
      ]);
      const p = profileRes.data;
      setProfile(p);
      setSub(subRes.data);
      setDietType(p.diet_type || "keto");
      setGoal(p.goal || "fat_loss");
      setActivityLevel(p.activity_level || "moderate");
      setAge(p.age?.toString() || "");
      setWeightKg(p.weight_kg?.toString() || "");
      setHeightCm(p.height_cm?.toString() || "");
      setGender(p.gender || "male");
      setWeeklyBudget(p.weekly_budget?.toString() || "");

      const u = JSON.parse(localStorage.getItem("keto_user") || "{}");
      setUser(u);
      setFullName(u.full_name || "");
      setEmail(u.email || "");
    } catch {}
    finally { setLoading(false); }
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveAccount = async () => {
    setAccountError("");
    setSaving(true);
    try {
      const payload: any = { full_name: fullName, email };
      if (newPwd) { payload.current_password = currentPwd; payload.new_password = newPwd; }
      const res = await api.patch("/users/account", payload);
      const updated = { ...user, full_name: res.data.full_name, email: res.data.email };
      localStorage.setItem("keto_user", JSON.stringify(updated));
      setUser(updated);
      setCurrentPwd(""); setNewPwd("");
      showSaved();
    } catch (err: any) {
      setAccountError(err.response?.data?.detail || "Error saving changes");
    } finally { setSaving(false); }
  };

  const saveGoals = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/users/goals", {
        diet_type: dietType,
        goal,
        activity_level: activityLevel,
        age: parseInt(age),
        weight_kg: parseFloat(weightKg),
        height_cm: parseFloat(heightCm),
        gender,
        weekly_budget: weeklyBudget ? parseFloat(weeklyBudget) : null,
      });
      setNewMacros(res.data.macros);
      showSaved();
    } catch {} finally { setSaving(false); }
  };

  const openPortal = async () => {
    try {
      const res = await api.get("/payments/portal");
      window.location.href = res.data.portal_url;
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "var(--text)" }}>Profile</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Manage your account, goals and subscription</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === t.id ? {
                background: "var(--accent)",
                color: "#fff",
              } : { color: "var(--text-muted)" }}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── ACCOUNT TAB ── */}
      {tab === "account" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Section title="Personal info">
            <Field label="Full name">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </Field>
          </Section>

          <Section title="Change password">
            <Field label="Current password">
              <div className="relative">
                <Input type={showPwd ? "text" : "password"} value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="••••••••" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPwd(!showPwd)} style={{ color: "var(--text-muted)" }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
            <Field label="New password">
              <Input type={showPwd ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Min 8 characters" />
            </Field>
          </Section>

          {accountError && (
            <p className="text-sm text-red-500 mb-3">{accountError}</p>
          )}

          <button
            onClick={saveAccount}
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: "var(--accent)" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save changes"}
          </button>
        </motion.div>
      )}

      {/* ── GOALS TAB ── */}
      {tab === "goals" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Section title="Diet & Goal">
            <Field label="Diet type">
              <div className="grid grid-cols-3 gap-2">
                {DIET_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDietType(d.value)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={dietType === d.value ? {
                      background: "var(--accent-light)",
                      border: "1.5px solid var(--accent)",
                    } : { background: "var(--bg)", border: "1.5px solid var(--border)" }}
                  >
                    <p className="text-sm font-bold" style={{ color: dietType === d.value ? "var(--accent)" : "var(--text)" }}>{d.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{d.desc}</p>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Goal">
              <div className="flex gap-2">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={goal === g.value ? {
                      background: "var(--accent)",
                      color: "#fff",
                    } : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Activity level">
              <div className="space-y-2">
                {ACTIVITY_OPTIONS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setActivityLevel(a.value)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                    style={activityLevel === a.value ? {
                      background: "var(--accent-light)",
                      border: "1.5px solid var(--accent)",
                    } : { background: "var(--bg)", border: "1.5px solid var(--border)" }}
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color: activityLevel === a.value ? "var(--accent)" : "var(--text)" }}>{a.label}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{a.desc}</p>
                    </div>
                    {activityLevel === a.value && <Check className="w-4 h-4" style={{ color: "var(--accent)" }} />}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Body measurements">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age">
                <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="30" />
              </Field>
              <Field label="Gender">
                <div className="flex gap-2">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                      style={gender === g ? { background: "var(--accent)", color: "#fff" } : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Weight (kg)">
                <Input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70" />
              </Field>
              <Field label="Height (cm)">
                <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="170" />
              </Field>
              <Field label="Weekly budget (€)">
                <Input type="number" value={weeklyBudget} onChange={(e) => setWeeklyBudget(e.target.value)} placeholder="100" />
              </Field>
            </div>
          </Section>

          {newMacros && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 mb-4"
              style={{ background: "linear-gradient(135deg, #FFF7F0, #FFE8D6)", border: "1.5px solid #FFD4B2" }}
            >
              <p className="text-sm font-bold mb-3" style={{ color: "var(--accent)" }}>✅ New macros calculated</p>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: "Calories", value: newMacros.calories, unit: "kcal" },
                  { label: "Fat", value: newMacros.fat_g, unit: "g" },
                  { label: "Protein", value: newMacros.protein_g, unit: "g" },
                  { label: "Carbs", value: newMacros.carbs_g, unit: "g" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.6)" }}>
                    <p className="text-lg font-black" style={{ color: "var(--accent)" }}>{m.value}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.label} {m.unit}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <button
            onClick={saveGoals}
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: "var(--accent)" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save & recalculate macros"}
          </button>
        </motion.div>
      )}

      {/* ── SUBSCRIPTION TAB ── */}
      {tab === "subscription" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Section title="Current plan">
            <div className="flex items-center justify-between p-4 rounded-xl mb-4"
              style={sub?.plan_tier !== "free"
                ? { background: "linear-gradient(135deg, #E8620A, #C4500A)" }
                : { background: "var(--bg)", border: "1px solid var(--border)" }
              }
            >
              <div>
                <p className="text-lg font-black capitalize" style={{ color: sub?.plan_tier !== "free" ? "#fff" : "var(--text)" }}>
                  {sub?.plan_tier === "pro" ? "Pro Plan" : sub?.plan_tier === "elite" ? "Elite Plan" : "Free Plan"}
                </p>
                <p className="text-sm" style={{ color: sub?.plan_tier !== "free" ? "rgba(255,255,255,0.75)" : "var(--text-muted)" }}>
                  {sub?.plan_tier === "free" ? "Limited features" : sub?.plan_tier === "pro" ? "14€/month" : "29€/month"}
                  {sub?.cancel_at_period_end && " · Cancels at period end"}
                  {sub?.status === "past_due" && " · Payment failed"}
                </p>
              </div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={sub?.plan_tier !== "free"
                  ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                  : { background: "var(--accent-light)", color: "var(--accent)" }
                }
              >
                {sub?.status === "active" ? "Active" : sub?.status === "past_due" ? "Past Due" : sub?.status === "canceled" ? "Canceled" : "Free"}
              </span>
            </div>

            {sub?.plan_tier !== "free" ? (
              <button
                onClick={openPortal}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                Manage subscription (cancel, change card...)
                <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              </button>
            ) : (
              <div>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  Upgrade to Pro to unlock unlimited meal plans, unlimited AI coaching and more.
                </p>
                <Link href="/#pricing">
                  <button
                    className="w-full py-3.5 rounded-xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}
                  >
                    Upgrade to Pro — 14€/month →
                  </button>
                </Link>
              </div>
            )}
          </Section>

          {sub?.plan_tier !== "free" && (
            <Section title="Features included">
              {(sub?.plan_tier === "pro" ? [
                "Unlimited weekly meal plans",
                "Unlimited AI Coach messages",
                "Instant meal swaps",
                "Full macro tracking",
                "Progress analytics",
                "Keto & carnivore modes",
              ] : [
                "Everything in Pro",
                "Custom meal creation",
                "Advanced analytics",
                "Priority support",
                "Export PDF plans",
                "Family mode (4 profiles)",
              ]).map((f) => (
                <div key={f} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                  <span className="text-sm" style={{ color: "var(--text)" }}>{f}</span>
                </div>
              ))}
            </Section>
          )}
        </motion.div>
      )}
    </div>
  );
}
