"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, RefreshCw, X, ChevronDown, ChevronUp, Flame } from "lucide-react";
import api from "@/lib/api";
import { getWeekStart, formatDate, DAY_NAMES, MEAL_TYPES } from "@/lib/utils";
import Image from "next/image";

function MealCard({ slot, onSwap, onEaten }: { slot: any; onSwap: (slot: any) => void; onEaten: (slot: any) => void }) {
  const meal = slot?.meal;
  if (!meal) return null;

  return (
    <motion.div
      layout
      className={`glass glass-hover rounded-2xl overflow-hidden group relative ${slot.is_eaten ? "opacity-60" : ""}`}
      whileHover={{ y: -2 }}
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden bg-white/5">
        {meal.image_url && (
          <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => onSwap(slot)}
            className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-amber-500/80 transition-colors opacity-0 group-hover:opacity-100"
            title="Swap meal"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            meal.diet_type === "carnivore" ? "bg-red-500/20 text-red-300" :
            meal.diet_type === "both" ? "bg-amber-500/20 text-amber-300" :
            "bg-green-500/20 text-green-300"
          }`}>
            {meal.diet_type === "both" ? "keto" : meal.diet_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm font-semibold text-white truncate mb-2">{meal.name}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {meal.prep_time_mins + meal.cook_time_mins}m
          </span>
          <span className="font-medium" style={{ color: "#F59E0B" }}>{meal.calories} kcal</span>
        </div>

        {/* Macro pills */}
        <div className="flex gap-1">
          <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300">F{meal.fat_g}g</span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-300">P{meal.protein_g}g</span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-red-500/15 text-red-300">C{meal.carbs_g}g</span>
        </div>
      </div>

      {/* Eaten toggle */}
      <button
        onClick={() => onEaten(slot)}
        className="absolute top-2 left-2 w-6 h-6 rounded-full border flex items-center justify-center transition-all"
        style={{
          borderColor: slot.is_eaten ? "#F59E0B" : "rgba(255,255,255,0.2)",
          background: slot.is_eaten ? "#F59E0B" : "transparent",
        }}
        title="Mark as eaten"
      >
        {slot.is_eaten && <span className="text-black text-xs font-bold">✓</span>}
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-6 w-full max-w-md relative z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">Swap meal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-gray-400 text-sm mb-4">Replacing: <span className="text-amber-300">{slot.meal.name}</span></p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((meal) => (
              <motion.button
                key={meal.id}
                onClick={() => swap(meal.id)}
                className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 transition-all text-left"
                whileHover={{ scale: 1.01 }}
              >
                {meal.image_url && (
                  <img src={meal.image_url} alt={meal.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">{meal.name}</p>
                  <p className="text-xs text-gray-500">{meal.calories} kcal · F{meal.fat_g}g P{meal.protein_g}g C{meal.carbs_g}g</p>
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
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Meal Plan</h1>
          <p className="text-gray-400 mt-1">Week of {new Date(weekStart).toLocaleDateString("en", { month: "long", day: "numeric" })}</p>
        </div>
        <motion.button
          onClick={generate}
          disabled={generating}
          className="btn-primary flex items-center gap-2 py-2.5 px-5"
          whileHover={{ scale: 1.02 }}
        >
          {generating ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Flame className="w-4 h-4" /> {weekPlan ? "Regenerate" : "Generate plan"}</>}
        </motion.button>
      </motion.div>

      {!weekPlan ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-400 text-lg">No meal plan yet. Generate one above!</p>
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
                className={`rounded-2xl p-3 ${isToday ? "ring-1 ring-amber-500/30 bg-amber-500/5" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-sm font-bold ${isToday ? "text-amber-400" : "text-gray-500"}`}>{day}</p>
                  {isToday && <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md">Today</span>}
                </div>
                <p className="text-xs text-gray-600 mb-3">{dayCalories} kcal</p>

                <div className="space-y-3">
                  {MEAL_TYPES.map((mt) => {
                    const slot = slots.find((s: any) => s.meal_type === mt);
                    if (!slot) return <div key={mt} className="h-24 rounded-xl bg-white/3 border border-dashed border-white/10 flex items-center justify-center"><p className="text-xs text-gray-700 capitalize">{mt}</p></div>;
                    return (
                      <MealCard
                        key={slot.id}
                        slot={slot}
                        onSwap={() => setSwapSlot(slot)}
                        onEaten={markEaten}
                      />
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
          <SwapModal
            slot={swapSlot}
            planId={weekPlan.id}
            onClose={() => setSwapSlot(null)}
            onSwapped={loadPlan}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
