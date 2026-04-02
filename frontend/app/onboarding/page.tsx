"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Flame, ChevronRight, ChevronLeft } from "lucide-react";
import api from "@/lib/api";

const STEPS = 5;

const DIET_OPTIONS = [
  { value: "keto", label: "Keto", emoji: "🥑", desc: "70% fat, 25% protein, 5% carbs. Max 20g net carbs." },
  { value: "carnivore", label: "Carnivore", emoji: "🥩", desc: "Animal products only. Zero carbs, maximum nutrition density." },
  { value: "ketovore", label: "Ketovore", emoji: "🔥", desc: "Mostly carnivore with some low-carb plants allowed." },
];

const GOAL_OPTIONS = [
  { value: "fat_loss", label: "Lose fat", emoji: "📉", desc: "Burn stored fat as primary fuel" },
  { value: "maintenance", label: "Maintain weight", emoji: "⚖️", desc: "Maintain current body composition" },
  { value: "muscle_gain", label: "Build muscle", emoji: "💪", desc: "Gain lean mass while staying ketogenic" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", desc: "Desk job, little exercise" },
  { value: "light", label: "Lightly active", desc: "1-3 days/week exercise" },
  { value: "moderate", label: "Moderately active", desc: "3-5 days/week exercise" },
  { value: "active", label: "Very active", desc: "6-7 days/week exercise" },
  { value: "very_active", label: "Athlete", desc: "Daily intense training" },
];

const ALLERGY_OPTIONS = ["dairy", "eggs", "fish", "shellfish", "tree-nuts", "peanuts"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    diet_type: "keto",
    goal: "fat_loss",
    activity_level: "moderate",
    age: 30,
    weight_kg: 80,
    height_cm: 175,
    gender: "male",
    weekly_budget: 100,
    allergies: [] as string[],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const next = () => { setDir(1); setStep((s) => s + 1); };
  const back = () => { setDir(-1); setStep((s) => s - 1); };

  const toggleAllergy = (a: string) => {
    setData((d) => ({
      ...d,
      allergies: d.allergies.includes(a) ? d.allergies.filter((x) => x !== a) : [...d.allergies, a],
    }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/users/onboarding", data);
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "var(--bg-primary)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 60%)" }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-amber-gradient flex items-center justify-center">
            <Flame className="w-4 h-4 text-black" fill="black" />
          </div>
          <span className="font-bold text-white">KetoCoach</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {[...Array(STEPS)].map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--accent)" }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Step 0 — Diet type */}
              {step === 0 && (
                <div className="glass rounded-3xl p-8">
                  <h2 className="text-2xl font-black text-white mb-2">Choose your diet</h2>
                  <p className="text-gray-400 text-sm mb-6">This shapes every meal plan we create for you.</p>
                  <div className="space-y-3">
                    {DIET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setData({ ...data, diet_type: opt.value })}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                          data.diet_type === opt.value
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <p className="font-semibold text-white">{opt.label}</p>
                          <p className="text-sm text-gray-400">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1 — Goal */}
              {step === 1 && (
                <div className="glass rounded-3xl p-8">
                  <h2 className="text-2xl font-black text-white mb-2">What's your goal?</h2>
                  <p className="text-gray-400 text-sm mb-6">We'll calibrate your calories accordingly.</p>
                  <div className="space-y-3">
                    {GOAL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setData({ ...data, goal: opt.value })}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                          data.goal === opt.value
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <p className="font-semibold text-white">{opt.label}</p>
                          <p className="text-sm text-gray-400">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 — Body metrics */}
              {step === 2 && (
                <div className="glass rounded-3xl p-8">
                  <h2 className="text-2xl font-black text-white mb-2">Your measurements</h2>
                  <p className="text-gray-400 text-sm mb-6">Used to calculate your exact macro targets.</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Age</label>
                        <input type="number" value={data.age} onChange={(e) => setData({ ...data, age: +e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Gender</label>
                        <select value={data.gender} onChange={(e) => setData({ ...data, gender: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none">
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Weight (kg)</label>
                        <input type="number" value={data.weight_kg} onChange={(e) => setData({ ...data, weight_kg: +e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Height (cm)</label>
                        <input type="number" value={data.height_cm} onChange={(e) => setData({ ...data, height_cm: +e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Activity Level</label>
                      <select value={data.activity_level} onChange={(e) => setData({ ...data, activity_level: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none">
                        {ACTIVITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 — Budget */}
              {step === 3 && (
                <div className="glass rounded-3xl p-8">
                  <h2 className="text-2xl font-black text-white mb-2">Weekly food budget</h2>
                  <p className="text-gray-400 text-sm mb-6">We'll prioritize affordable meals within your range.</p>
                  <div className="space-y-6">
                    <div className="text-center">
                      <span className="text-5xl font-black gradient-text">{data.weekly_budget}€</span>
                      <p className="text-gray-500 text-sm mt-1">per week</p>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={300}
                      step={10}
                      value={data.weekly_budget}
                      onChange={(e) => setData({ ...data, weekly_budget: +e.target.value })}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>30€ budget</span>
                      <span>300€ premium</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Allergies */}
              {step === 4 && (
                <div className="glass rounded-3xl p-8">
                  <h2 className="text-2xl font-black text-white mb-2">Any food allergies?</h2>
                  <p className="text-gray-400 text-sm mb-6">We'll exclude these ingredients from all your meal plans.</p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {ALLERGY_OPTIONS.map((a) => (
                      <button
                        key={a}
                        onClick={() => toggleAllergy(a)}
                        className={`px-4 py-2 rounded-xl border text-sm capitalize transition-all ${
                          data.allergies.includes(a)
                            ? "border-amber-500 bg-amber-500/20 text-amber-300"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">Tap to toggle. Leave empty if no allergies.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button onClick={back} className="btn-ghost flex items-center gap-2 py-3 px-5">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < STEPS - 1 ? (
            <motion.button
              onClick={next}
              className="btn-primary flex items-center gap-2 py-3 px-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={submit}
              disabled={loading}
              className="btn-primary flex items-center gap-2 py-3 px-6"
              whileHover={{ scale: 1.02 }}
            >
              {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Generate my plan →"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
