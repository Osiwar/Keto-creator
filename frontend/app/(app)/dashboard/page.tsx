"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Calendar, ShoppingCart, Flame, Zap, MessageCircle } from "lucide-react";
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
  const [planLimitReached, setPlanLimitReached] = useState(false);

  const weekStart = formatDate(getWeekStart());
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const profileRes = await api.get("/users/profile");
      setProfile(profileRes.data);
      if (!profileRes.data.onboarding_done) { router.push("/onboarding"); return; }
      try {
        const planRes = await api.get(`/meal-plans?week_start=${weekStart}`);
        setWeekPlan(planRes.data);
      } catch { /* No plan yet */ }
    } catch { router.push("/login"); }
    finally { setLoading(false); }
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/meal-plans/generate", { week_start: weekStart });
      setWeekPlan(res.data);
    } catch (err: any) {
      if (err.response?.data?.detail === "PLAN_LIMIT_REACHED") {
        setPlanLimitReached(true);
      }
    } finally { setGenerating(false); }
  };

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

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "var(--text)" }}>Dashboard</h1>
        <p className="mt-1" style={{ color: "var(--text-muted)" }}>
          Week of {new Date(weekStart + "T12:00:00").toLocaleDateString("en", { month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* No plan state */}
      {planLimitReached && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 text-center mb-8"
          style={{ background: "linear-gradient(135deg, #FFF7F0, #FFE8D6)", border: "1.5px solid #FFD4B2" }}
        >
          <div className="text-4xl mb-3">⚡</div>
          <h2 className="text-2xl font-black mb-2" style={{ color: "var(--text)" }}>Free plan limit reached</h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            The free plan includes 1 meal plan. Upgrade to Pro for unlimited weekly plans.
          </p>
          <a
            href="/#pricing"
            className="inline-block px-8 py-4 rounded-2xl font-bold text-white shadow-md"
            style={{ background: "var(--accent)" }}
          >
            Upgrade to Pro — 14€/month →
          </a>
        </motion.div>
      )}

      {!weekPlan && !planLimitReached && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-10 text-center mb-8 shadow-sm"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--accent-light)", border: "1px solid var(--border)" }}
          >
            <Zap className="w-9 h-9" style={{ color: "var(--accent)" }} />
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ color: "var(--text)" }}>No plan for this week</h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Generate your personalized {profile?.diet_type} meal plan in seconds.
          </p>
          <motion.button
            onClick={generatePlan}
            disabled={generating}
            className="px-8 py-4 rounded-2xl font-bold text-white flex items-center gap-2 mx-auto shadow-md"
            style={{ background: "var(--accent)" }}
            whileHover={{ scale: 1.02 }}
          >
            {generating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Flame className="w-4 h-4" /> Generate my week</>
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
            className="rounded-3xl p-6 mb-6 shadow-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Today&apos;s Macros</h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{DAY_NAMES[todayIndex]}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black" style={{ color: "var(--accent)" }}>{todayMacros.calories}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>/ {targets.calories} kcal</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <ProgressRing value={(todayMacros.fat / targets.fat) * 100} color={MACRO_COLORS.fat} label="Fat" sublabel={`${Math.round(todayMacros.fat)}g / ${targets.fat}g`} size={120} />
              <ProgressRing value={(todayMacros.protein / targets.protein) * 100} color={MACRO_COLORS.protein} label="Protein" sublabel={`${Math.round(todayMacros.protein)}g / ${targets.protein}g`} size={120} />
              <ProgressRing value={(todayMacros.carbs / targets.carbs) * 100} color={MACRO_COLORS.carbs} label="Carbs" sublabel={`${Math.round(todayMacros.carbs)}g / ${targets.carbs}g max`} size={120} />
            </div>
          </motion.div>

          {/* Weekly overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl p-6 mb-6 shadow-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>This Week</h2>
              <Link href="/meal-plan">
                <button className="text-sm font-medium" style={{ color: "var(--accent)" }}>View full plan →</button>
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-2 overflow-x-auto min-w-0">
              {DAY_NAMES.map((day, i) => {
                const dayMeals = weekPlan.days?.[i] || [];
                const isToday = i === todayIndex;
                const dayKcal = dayMeals.reduce((sum: number, s: any) => sum + (s.meal?.calories || 0), 0);
                const kcalPct = Math.min((dayKcal / targets.calories) * 100, 100);
                const eatenCount = dayMeals.filter((s: any) => s.is_eaten).length;
                const MEAL_COLORS = ["#E8620A", "#10B981", "#8B5CF6"];
                const MEAL_EMOJIS = ["🌅", "☀️", "🌙"];

                return (
                  <motion.div
                    key={day}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl p-3 flex flex-col gap-2 cursor-default"
                    style={{
                      background: isToday ? "var(--accent-light)" : "var(--bg-alt)",
                      border: isToday ? "2px solid var(--accent)" : "1px solid var(--border)",
                      boxShadow: isToday ? "0 4px 16px rgba(232,98,10,0.12)" : "none",
                    }}
                  >
                    {/* Day label */}
                    <div className="text-center">
                      <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: isToday ? "var(--accent)" : "var(--text-muted)" }}>
                        {day}
                      </p>
                      {isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white mt-0.5 inline-block" style={{ background: "var(--accent)" }}>
                          Today
                        </span>
                      )}
                    </div>

                    {/* Meal type dots */}
                    <div className="flex flex-col gap-1">
                      {dayMeals.slice(0, 3).map((slot: any, mi: number) => (
                        <div key={slot.id} className="flex items-center gap-1.5" title={slot.meal?.name}>
                          <span className="text-[10px]">{MEAL_EMOJIS[mi]}</span>
                          <div
                            className="flex-1 h-1.5 rounded-full transition-all"
                            style={{
                              background: slot.is_eaten
                                ? MEAL_COLORS[mi]
                                : `${MEAL_COLORS[mi]}30`,
                            }}
                          />
                        </div>
                      ))}
                      {dayMeals.length === 0 && (
                        <div className="flex flex-col gap-1">
                          {[0, 1, 2].map((mi) => (
                            <div key={mi} className="flex items-center gap-1.5">
                              <span className="text-[10px] opacity-30">{MEAL_EMOJIS[mi]}</span>
                              <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Calorie progress bar */}
                    <div>
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: isToday ? "var(--accent)" : "#10B981" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${kcalPct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                        />
                      </div>
                      <p className="text-[10px] text-center mt-1 font-medium" style={{ color: isToday ? "var(--accent)" : "var(--text-muted)" }}>
                        {dayKcal > 0 ? `${dayKcal} kcal` : "—"}
                      </p>
                    </div>

                    {/* Eaten badge */}
                    {eatenCount > 0 && (
                      <div className="text-center">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#059669" }}>
                          {eatenCount}/{dayMeals.length} eaten
                        </span>
                      </div>
                    )}
                  </motion.div>
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
              { href: "/meal-plan", icon: Calendar, label: "View Meal Plan", desc: "Full weekly calendar", color: "#E8620A" },
              { href: "/shopping", icon: ShoppingCart, label: "Shopping List", desc: "Generate your grocery list", color: "#10B981" },
              { href: "/coach", icon: MessageCircle, label: "Ask AI Coach", desc: "Get nutrition advice", color: "#8B5CF6" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    className="p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    whileHover={{ scale: 1.01, y: -2 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${action.color}18`, border: `1px solid ${action.color}40` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{action.label}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{action.desc}</p>
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
