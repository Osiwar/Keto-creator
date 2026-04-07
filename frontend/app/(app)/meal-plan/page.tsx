"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, RefreshCw, X, Flame } from "lucide-react";
import api from "@/lib/api";
import { getWeekStart, formatDate, DAY_NAMES, MEAL_TYPES } from "@/lib/utils";

function MealCard({ slot, onSwap, onEaten }: { slot: any; onSwap: (slot: any) => void; onEaten: (slot: any) => void }) {
  const meal = slot?.meal;
  if (!meal) return null;

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden group relative"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        opacity: slot.is_eaten ? 0.65 : 1,
      }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden" style={{ background: "var(--bg-alt)" }}>
        {meal.image_url && (
          <img
            src={meal.image_url}
            alt={meal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onSwap(slot)}
            className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
            title="Swap meal"
          >
            <RefreshCw className="w-3 h-3" style={{ color: "var(--accent)" }} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
            style={{
              background: meal.diet_type === "carnivore" ? "rgba(239,68,68,0.8)" :
                meal.diet_type === "both" ? "rgba(232,98,10,0.8)" : "rgba(16,185,129,0.8)"
            }}
          >
            {meal.diet_type === "both" ? "keto" : meal.diet_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm font-semibold truncate mb-2" style={{ color: "var(--text)" }}>{meal.name}</p>
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {meal.prep_time_mins + meal.cook_time_mins}m
          </span>
          <span className="font-semibold" style={{ color: "var(--accent)" }}>{meal.calories} kcal</span>
        </div>
        <div className="flex gap-1">
          <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "rgba(232,98,10,0.12)", color: "var(--accent-dark)" }}>F{meal.fat_g}g</span>
          <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>P{meal.protein_g}g</span>
          <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: "rgba(139,92,246,0.12)", color: "#7C3AED" }}>C{meal.carbs_g}g</span>
        </div>
      </div>

      {/* Eaten toggle */}
      <button
        onClick={() => onEaten(slot)}
        className="absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-sm"
        style={{
          borderColor: slot.is_eaten ? "var(--accent)" : "rgba(255,255,255,0.8)",
          background: slot.is_eaten ? "var(--accent)" : "rgba(255,255,255,0.9)",
        }}
        title="Mark as eaten"
      >
        {slot.is_eaten && <span className="text-white text-xs font-bold">✓</span>}
      </button>
    </motion.div>
  );
}

function SwapModal({ slot, planId, onClose, onSwapped }: any) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/meals?meal_type=${slot.meal.meal_type}&limit=6`).then((r) => {
      setSuggestions(r.data.items.filter((m: any) => m.id !== slot.meal.id).slice(0, 4));
      setLoading(false);
    });
  }, [slot]);

  const swap = async (mealId: number) => {
    await api.put(`/meal-plans/${planId}/slot`, { slot_id: slot.id, meal_id: mealId });
    onSwapped();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{ color: "var(--text)" }}>Swap meal</h3>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Replacing: <span style={{ color: "var(--accent)", fontWeight: 600 }}>{slot.meal.name}</span>
        </p>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((meal) => (
              <motion.button
                key={meal.id}
                onClick={() => swap(meal.id)}
                className="w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left"
                style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}
                whileHover={{ scale: 1.01, borderColor: "var(--accent)" }}
              >
                {meal.image_url && (
                  <img src={meal.image_url} alt={meal.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{meal.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{meal.calories} kcal · F{meal.fat_g}g P{meal.protein_g}g C{meal.carbs_g}g</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function MealPlanPage() {
  const [weekPlan, setWeekPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [swapSlot, setSwapSlot] = useState<any>(null);
  const weekStart = formatDate(getWeekStart());

  useEffect(() => { loadPlan(); }, []);

  const loadPlan = async () => {
    try {
      const res = await api.get(`/meal-plans?week_start=${weekStart}`);
      setWeekPlan(res.data);
    } catch { /* no plan */ }
    setLoading(false);
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/meal-plans/generate", { week_start: weekStart });
      setWeekPlan(res.data);
    } finally { setGenerating(false); }
  };

  const markEaten = async (slot: any) => {
    if (!weekPlan) return;
    await api.patch(`/meal-plans/${weekPlan.id}/slot/${slot.id}/eaten`);
    loadPlan();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
    </div>
  );

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "var(--text)" }}>Meal Plan</h1>
          <p className="mt-1" style={{ color: "var(--text-muted)" }}>
            Week of {new Date(weekStart + "T12:00:00").toLocaleDateString("en", { month: "long", day: "numeric" })}
          </p>
        </div>
        <motion.button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 py-2.5 px-5 rounded-2xl font-bold text-white shadow-md"
          style={{ background: "var(--accent)" }}
          whileHover={{ scale: 1.02 }}
        >
          {generating
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Flame className="w-4 h-4" /> {weekPlan ? "Regenerate" : "Generate plan"}</>
          }
        </motion.button>
      </motion.div>

      {!weekPlan ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl p-12 text-center shadow-sm"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>No meal plan yet. Generate one above!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {DAY_NAMES.map((day, i) => {
            const slots = weekPlan.days?.[i] || [];
            const isToday = i === todayIndex;
            const dayCalories = slots.reduce((s: number, sl: any) => s + (sl.meal?.calories || 0), 0);

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-3"
                style={{
                  background: isToday ? "var(--accent-light)" : "transparent",
                  border: isToday ? "1.5px solid var(--accent)" : "1px solid transparent",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold" style={{ color: isToday ? "var(--accent)" : "var(--text-muted)" }}>{day}</p>
                  {isToday && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-medium text-white" style={{ background: "var(--accent)" }}>Today</span>
                  )}
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{dayCalories} kcal</p>

                <div className="space-y-3">
                  {MEAL_TYPES.map((mt) => {
                    const slot = slots.find((s: any) => s.meal_type === mt);
                    if (!slot) return (
                      <div
                        key={mt}
                        className="h-24 rounded-xl border border-dashed flex items-center justify-center"
                        style={{ borderColor: "var(--border)", background: "var(--bg-alt)" }}
                      >
                        <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{mt}</p>
                      </div>
                    );
                    return (
                      <MealCard key={slot.id} slot={slot} onSwap={() => setSwapSlot(slot)} onEaten={markEaten} />
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {swapSlot && weekPlan && (
          <SwapModal slot={swapSlot} planId={weekPlan.id} onClose={() => setSwapSlot(null)} onSwapped={loadPlan} />
        )}
      </AnimatePresence>
    </div>
  );
}
