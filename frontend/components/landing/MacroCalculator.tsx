"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ChevronRight, Flame } from "lucide-react";
import api from "@/lib/api";

interface MacroResult { calories: number; fat_g: number; protein_g: number; carbs_g: number; }

function MacroBar({ label, value, max, color, bg }: { label: string; value: number; max: number; color: string; bg: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{label}</span>
        <span className="text-sm font-black" style={{ color }}>{value}g</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: bg }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}

export default function MacroCalculator() {
  const [form, setForm] = useState({ age: 30, weight_kg: 80, height_cm: 175, gender: "male", activity_level: "moderate", goal: "fat_loss", diet_type: "keto" });
  const [result, setResult] = useState<MacroResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(form as any).toString();
      const res = await api.get(`/macros/calculator?${params}`);
      setResult(res.data);
    } catch {
      const tdee = Math.round(10 * form.weight_kg + 6.25 * form.height_cm - 5 * form.age + (form.gender === "male" ? 5 : -161));
      const mult: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      const target = Math.round(tdee * (mult[form.activity_level] || 1.55) * (form.goal === "fat_loss" ? 0.8 : form.goal === "muscle_gain" ? 1.1 : 1));
      setResult({ calories: target, fat_g: Math.round(target * 0.7 / 9), protein_g: Math.round(target * 0.25 / 4), carbs_g: 20 });
    } finally { setLoading(false); }
  };

  const selectClass = "input-field appearance-none cursor-pointer";

  return (
    <section id="how-it-works" className="py-28 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <div className="section-label mx-auto w-fit">Free calculator</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--text)" }}>
            Calculate your keto macros
          </h2>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>No account needed. See your personalized targets instantly.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="card p-8 md:p-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="space-y-5">
              <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>Your details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Age</label>
                  <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: +e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={selectClass}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Weight (kg)</label>
                  <input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: +e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Height (cm)</label>
                  <input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: +e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Activity Level</label>
                <select value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })} className={selectClass}>
                  <option value="sedentary">Sedentary (desk job)</option>
                  <option value="light">Lightly active (1-3x/week)</option>
                  <option value="moderate">Moderately active (3-5x/week)</option>
                  <option value="active">Very active (6-7x/week)</option>
                  <option value="very_active">Athlete (daily intense)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Goal</label>
                  <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className={selectClass}>
                    <option value="fat_loss">Lose fat</option>
                    <option value="maintenance">Maintain</option>
                    <option value="muscle_gain">Gain muscle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Diet</label>
                  <select value={form.diet_type} onChange={(e) => setForm({ ...form, diet_type: e.target.value })} className={selectClass}>
                    <option value="keto">Keto</option>
                    <option value="carnivore">Carnivore</option>
                  </select>
                </div>
              </div>
              <motion.button onClick={calculate} disabled={loading} className="btn-primary w-full justify-center py-4 text-base" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Calculator className="w-5 h-5" /> Calculate my macros</>}
              </motion.button>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>Your targets</h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Based on your {form.diet_type} diet for {form.goal.replace("_", " ")}</p>
                  </div>

                  <div className="text-center p-6 rounded-2xl" style={{ background: "var(--accent-light)" }}>
                    <p className="text-5xl font-black gradient-text">{result.calories}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: "var(--accent)" }}>calories per day</p>
                  </div>

                  <div className="space-y-5">
                    <MacroBar label="Fat" value={result.fat_g} max={250} color="#E8620A" bg="#FFF0E6" />
                    <MacroBar label="Protein" value={result.protein_g} max={250} color="#8B5CF6" bg="#F3F0FF" />
                    <MacroBar label="Carbs (max)" value={result.carbs_g} max={50} color="#DC2626" bg="#FEF2F2" />
                  </div>

                  <a href="/register">
                    <motion.button className="btn-primary w-full justify-center py-4 text-base" whileHover={{ scale: 1.02 }}>
                      Get my personalized meal plan <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </a>
                </motion.div>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center gap-5 h-full">
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: "var(--accent-light)" }}>
                    <Flame className="w-12 h-12" style={{ color: "var(--accent)" }} />
                  </div>
                  <p className="text-base" style={{ color: "var(--text-muted)" }}>Fill in your details on the left and hit calculate to see your exact keto macro targets.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
