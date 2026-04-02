"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Calendar, ShoppingCart, Flame, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import ProgressRing from "@/components/ui/ProgressRing";
import { getWeekStart, formatDate, DAY_NAMES, MACRO_COLORS } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [weekPlan, setWeekPlan] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const weekStart = formatDate(getWeekStart());
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileRes = await api.get("/users/profile");
      setProfile(profileRes.data);

      if (!profileRes.data.onboarding_done) {
        router.push("/onboarding");
        return;
      }

      try {
        const planRes = await api.get(`/meal-plans?week_start=${weekStart}`);
        setWeekPlan(planRes.data);
      } catch {
        // No plan yet
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/meal-plans/generate", { week_start: weekStart });
      setWeekPlan(res.data);
    } finally {
      setGenerating(false);
    }
  };

  // Calculate today's macros from plan
  const todayMeals = weekPlan?.days?.[todayIndex] || [];
  const todayMacros = todayMeals.reduce(
    (acc: any, slot: any) => ({
      calories: acc.calories + (slot.meal?.calories || 0),
      fat: acc.fat + (slot.meal?.fat_g || 0),
      protein: acc.protein + (slot.meal?.protein_g || 0),
      carbs: acc.carbs + (slot.meal?.carbs_g || 0),
    }),
    { calories: 0, fat: 0, protein: 0, carbs: 0 }
  );

  const targets = {
    calories: profile?.target_calories || 1800,
    fat: profile?.target_fat_g || 140,
    protein: profile?.target_protein_g || 120,
    carbs: profile?.target_carbs_g || 20,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Week of {new Date(weekStart).toLocaleDateString("en", { month: "long", day: "numeric" })}</p>
      </motion.div>

      {/* No plan state */}
      {!weekPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-10 text-center mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-9 h-9 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">No plan for this week</h2>
          <p className="text-gray-400 mb-6">Generate your personalized {profile?.diet_type} meal plan in seconds.</p>
          <motion.button
            onClick={generatePlan}
            disabled={generating}
            className="btn-primary px-8 py-4 flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.02 }}
          >
            {generating ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Flame className="w-4 h-4" /> Generate my week
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {weekPlan && (
        <>
          {/* Macro rings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Today's Macros</h2>
                <p className="text-gray-400 text-sm">{DAY_NAMES[todayIndex]}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black gradient-text">{todayMacros.calories}</p>
                <p className="text-gray-500 text-sm">/ {targets.calories} kcal</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 flex-wrap">
              <ProgressRing
                value={(todayMacros.fat / targets.fat) * 100}
                color={MACRO_COLORS.fat}
                label="Fat"
                sublabel={`${Math.round(todayMacros.fat)}g / ${targets.fat}g`}
                size={120}
              />
              <ProgressRing
                value={(todayMacros.protein / targets.protein) * 100}
                color={MACRO_COLORS.protein}
                label="Protein"
                sublabel={`${Math.round(todayMacros.protein)}g / ${targets.protein}g`}
                size={120}
              />
              <ProgressRing
                value={(todayMacros.carbs / targets.carbs) * 100}
                color={MACRO_COLORS.carbs}
                label="Carbs"
                sublabel={`${Math.round(todayMacros.carbs)}g / ${targets.carbs}g max`}
                size={120}
              />
            </div>
          </motion.div>

          {/* Weekly overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6 mb-6 overflow-x-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">This Week</h2>
              <Link href="/meal-plan">
                <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">View full plan →</button>
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-2 min-w-[560px]">
              {DAY_NAMES.map((day, i) => {
                const dayMeals = weekPlan.days?.[i] || [];
                const isToday = i === todayIndex;
                return (
                  <div key={day} className={`rounded-xl p-3 ${isToday ? "bg-amber-500/10 border border-amber-500/20" : "bg-white/3"}`}>
                    <p className={`text-xs font-bold mb-2 text-center ${isToday ? "text-amber-400" : "text-gray-500"}`}>{day}</p>
                    <div className="space-y-1">
                      {dayMeals.slice(0, 3).map((slot: any) => (
                        <div key={slot.id} className={`w-full h-1.5 rounded-full ${slot.is_eaten ? "bg-amber-500" : "bg-white/10"}`} title={slot.meal?.name} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-2">
                      {dayMeals.reduce((sum: number, s: any) => sum + (s.meal?.calories || 0), 0)} kcal
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { href: "/meal-plan", icon: Calendar, label: "View Meal Plan", desc: "Full weekly calendar", color: "#F59E0B" },
              { href: "/shopping", icon: ShoppingCart, label: "Shopping List", desc: "Generate your grocery list", color: "#10B981" },
              { href: "/coach", icon: MessageCircle, label: "Ask AI Coach", desc: "Get nutrition advice", color: "#8B5CF6" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    className="glass glass-hover p-5 rounded-2xl flex items-center gap-4"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${action.color}18`, border: `1px solid ${action.color}30` }}>
                      <Icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{action.label}</p>
                      <p className="text-gray-500 text-xs">{action.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
}

// fix missing import
function MessageCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
