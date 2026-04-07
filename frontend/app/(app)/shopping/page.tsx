"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronDown, ChevronUp, Zap, Check, UtensilsCrossed } from "lucide-react";
import api from "@/lib/api";
import { getWeekStart, formatDate } from "@/lib/utils";

const SECTION_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  meat:    { label: "Meat & Poultry", emoji: "🥩", color: "#EF4444" },
  fish:    { label: "Fish & Seafood", emoji: "🐟", color: "#06B6D4" },
  dairy:   { label: "Dairy & Eggs",   emoji: "🥚", color: "#F59E0B" },
  produce: { label: "Produce",        emoji: "🥬", color: "#10B981" },
  pantry:  { label: "Pantry",         emoji: "🫙", color: "#8B5CF6" },
  other:   { label: "Other",          emoji: "🛒", color: "#6B7280" },
};

const SECTION_MAP: Record<string, string> = {
  beef: "meat", steak: "meat", chicken: "meat", pork: "meat",
  lamb: "meat", bacon: "meat", sausage: "meat", "ground beef": "meat",
  liver: "meat", heart: "meat", tallow: "pantry",
  salmon: "fish", tuna: "fish", shrimp: "seafood",
  egg: "dairy", butter: "dairy", cream: "dairy", cheese: "dairy",
  mozzarella: "dairy", parmesan: "dairy", ricotta: "dairy",
  avocado: "produce", arugula: "produce", zucchini: "produce",
  mushroom: "produce", celery: "produce", lettuce: "produce",
  garlic: "produce", lemon: "produce", rosemary: "produce",
  thyme: "produce", dill: "produce",
  "olive oil": "pantry", "coconut oil": "pantry", "almond butter": "pantry",
  "chia seeds": "pantry", vanilla: "pantry", paprika: "pantry",
  "bone broth": "pantry",
};

function categorize(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, section] of Object.entries(SECTION_MAP)) {
    if (lower.includes(keyword)) return section;
  }
  return "other";
}

const MEAL_EMOJIS: Record<string, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };

function ShoppingSection({ section, items, onToggle }: { section: string; items: any[]; onToggle?: (id: number) => void }) {
  const [open, setOpen] = useState(true);
  const meta = SECTION_LABELS[section] || SECTION_LABELS.other;
  const checked = items.filter((i) => i.is_checked).length;

  return (
    <div className="rounded-2xl overflow-hidden mb-4 shadow-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-3">
          <span className="text-xl">{meta.emoji}</span>
          <span className="font-semibold" style={{ color: "var(--text)" }}>{meta.label}</span>
          {onToggle && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{checked}/{items.length}</span>}
          {!onToggle && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--bg-alt)", color: "var(--text-muted)" }}>{items.length}</span>}
        </div>
        <div className="flex items-center gap-2">
          {onToggle && checked === items.length && items.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(16,185,129,0.15)", color: "#059669" }}>Done ✓</span>
          )}
          {open ? <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              {items.map((item, idx) => (
                <motion.button
                  key={item.id ?? idx}
                  onClick={() => onToggle && onToggle(item.id)}
                  className={`w-full flex items-center gap-3 py-2 text-left ${onToggle ? "cursor-pointer" : "cursor-default"}`}
                  whileHover={onToggle ? { x: 2 } : {}}
                >
                  {onToggle && (
                    <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ borderColor: item.is_checked ? meta.color : "var(--border)", background: item.is_checked ? meta.color : "transparent" }}>
                      {item.is_checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  )}
                  {!onToggle && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                  )}
                  <span className="text-sm flex-1" style={{ color: item.is_checked ? "var(--text-muted)" : "var(--text)", textDecoration: item.is_checked ? "line-through" : "none" }}>
                    {item.ingredient_name}
                  </span>
                  {(item.amount || item.unit) && (
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>{item.amount} {item.unit}</span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Build sections from items ─────────────────────────────────────────────────
function buildSections(items: any[]) {
  const sections: Record<string, any[]> = {};
  for (const item of items) {
    const sec = item.store_section || categorize(item.ingredient_name) || "other";
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(item);
  }
  return sections;
}

// ── Aggregate ingredients from selected meal objects ─────────────────────────
function aggregateIngredients(meals: any[]): any[] {
  const map: Record<string, any> = {};
  for (const meal of meals) {
    const ings: any[] = Array.isArray(meal.ingredients) ? meal.ingredients : [];
    for (const ing of ings) {
      const name = (ing.name || "").toLowerCase();
      if (!name) continue;
      if (!map[name]) {
        map[name] = {
          id: name,
          ingredient_name: ing.name,
          amount: ing.amount || "",
          unit: ing.unit || "",
          store_section: categorize(ing.name),
          is_checked: false,
        };
      }
    }
  }
  return Object.values(map);
}

export default function ShoppingPage() {
  const [tab, setTab] = useState<"week" | "meal">("week");

  // Week tab state
  const [shoppingList, setShoppingList] = useState<any>(null);
  const [mealPlanId, setMealPlanId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  // Meal tab state
  const [weekPlan, setWeekPlan] = useState<any>(null);
  const [selectedMealIds, setSelectedMealIds] = useState<Set<number>>(new Set());

  const [loading, setLoading] = useState(true);
  const weekStart = formatDate(getWeekStart());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const planRes = await api.get(`/meal-plans?week_start=${weekStart}`);
      setMealPlanId(planRes.data.id);
      setWeekPlan(planRes.data);
      try {
        const listRes = await api.get(`/shopping?meal_plan_id=${planRes.data.id}`);
        setShoppingList(listRes.data);
      } catch { /* no list yet */ }
    } catch { /* no plan */ }
    setLoading(false);
  };

  const generateList = async () => {
    if (!mealPlanId) return;
    setGenerating(true);
    try {
      const res = await api.post("/shopping/generate", { meal_plan_id: mealPlanId });
      setShoppingList(res.data);
    } finally { setGenerating(false); }
  };

  const toggleItem = async (id: number) => {
    await api.patch(`/shopping/items/${id}`);
    setShoppingList((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any) => item.id === id ? { ...item, is_checked: !item.is_checked } : item),
    }));
  };

  // All unique meals from the week plan (for "By Meal" tab)
  const allMeals: any[] = useMemo(() => {
    if (!weekPlan) return [];
    const seen = new Set<number>();
    const meals: any[] = [];
    for (let d = 0; d < 7; d++) {
      for (const slot of (weekPlan.days?.[d] || [])) {
        if (slot.meal && !seen.has(slot.meal.id)) {
          seen.add(slot.meal.id);
          meals.push(slot.meal);
        }
      }
    }
    return meals;
  }, [weekPlan]);

  const mealItems = useMemo(() => {
    const selected = allMeals.filter((m) => selectedMealIds.has(m.id));
    return aggregateIngredients(selected);
  }, [selectedMealIds, allMeals]);

  const toggleMeal = (id: number) => {
    setSelectedMealIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedMealIds(new Set(allMeals.map((m) => m.id)));
  const clearAll = () => setSelectedMealIds(new Set());

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
    </div>
  );

  const weekSections = buildSections(shoppingList?.items || []);
  const totalItems = shoppingList?.items?.length || 0;
  const checkedItems = shoppingList?.items?.filter((i: any) => i.is_checked).length || 0;
  const mealSections = buildSections(mealItems);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-4" style={{ color: "var(--text)" }}>Shopping List</h1>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
          {[
            { key: "week", label: "Full Week", icon: ShoppingCart },
            { key: "meal", label: "By Meal", icon: UtensilsCrossed },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: tab === key ? "var(--surface)" : "transparent",
                color: tab === key ? "var(--accent)" : "var(--text-muted)",
                boxShadow: tab === key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                border: tab === key ? "1px solid var(--border)" : "1px solid transparent",
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── TAB: FULL WEEK ─────────────────────────────────────────────────── */}
      {tab === "week" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              {shoppingList && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{checkedItems}/{totalItems} items checked</p>
              )}
            </div>
            {mealPlanId && (
              <motion.button
                onClick={generateList}
                disabled={generating}
                className="flex items-center gap-2 py-2.5 px-5 rounded-2xl font-bold text-white shadow-md"
                style={{ background: "var(--accent)" }}
                whileHover={{ scale: 1.02 }}
              >
                {generating
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Zap className="w-4 h-4" /> {shoppingList ? "Refresh" : "Generate"}</>
                }
              </motion.button>
            )}
          </div>

          {shoppingList && totalItems > 0 && (
            <div className="mb-6 rounded-full h-2 overflow-hidden" style={{ background: "var(--border)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--accent)" }}
                animate={{ width: `${(checkedItems / totalItems) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          {!mealPlanId && (
            <div className="rounded-3xl p-10 text-center shadow-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <ShoppingCart className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)" }}>Generate a meal plan first, then come back here.</p>
            </div>
          )}

          {mealPlanId && !shoppingList && (
            <div className="rounded-3xl p-10 text-center shadow-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <ShoppingCart className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--accent)", opacity: 0.5 }} />
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text)" }}>No list yet</h3>
              <p className="mb-6" style={{ color: "var(--text-muted)" }}>Generate a shopping list from your current meal plan.</p>
              <motion.button onClick={generateList} className="px-8 py-3 rounded-2xl font-bold text-white shadow-md" style={{ background: "var(--accent)" }} whileHover={{ scale: 1.02 }}>
                Generate shopping list
              </motion.button>
            </div>
          )}

          {shoppingList && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {Object.entries(weekSections).map(([section, items]) => (
                <ShoppingSection key={section} section={section} items={items} onToggle={toggleItem} />
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* ── TAB: BY MEAL ───────────────────────────────────────────────────── */}
      {tab === "meal" && (
        <>
          {!weekPlan ? (
            <div className="rounded-3xl p-10 text-center shadow-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)" }}>Generate a meal plan first to use this feature.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Meal selector */}
              <div className="mb-6 rounded-3xl p-5 shadow-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold" style={{ color: "var(--text)" }}>
                    Select meals <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>({selectedMealIds.size} selected)</span>
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs font-medium px-3 py-1 rounded-lg" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>All</button>
                    <button onClick={clearAll} className="text-xs font-medium px-3 py-1 rounded-lg" style={{ background: "var(--bg-alt)", color: "var(--text-muted)" }}>Clear</button>
                  </div>
                </div>

                <div className="space-y-2">
                  {allMeals.map((meal) => {
                    const selected = selectedMealIds.has(meal.id);
                    return (
                      <motion.button
                        key={meal.id}
                        onClick={() => toggleMeal(meal.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                        style={{
                          background: selected ? "var(--accent-light)" : "var(--bg-alt)",
                          border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                        }}
                        whileHover={{ scale: 1.005 }}
                      >
                        {/* Checkbox */}
                        <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ borderColor: selected ? "var(--accent)" : "var(--border)", background: selected ? "var(--accent)" : "transparent" }}>
                          {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>

                        {/* Image */}
                        {meal.image_url && (
                          <img src={meal.image_url} alt={meal.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        {!meal.image_url && (
                          <span className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: "var(--border)" }}>
                            {MEAL_EMOJIS[meal.meal_type] || "🍽️"}
                          </span>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{meal.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {MEAL_EMOJIS[meal.meal_type]} {meal.meal_type} · {meal.calories} kcal · {Array.isArray(meal.ingredients) ? meal.ingredients.length : 0} ingredients
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Ingredient list for selected meals */}
              {selectedMealIds.size === 0 && (
                <div className="rounded-2xl p-8 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select one or more meals above to see their ingredients.</p>
                </div>
              )}

              {selectedMealIds.size > 0 && mealItems.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold" style={{ color: "var(--text)" }}>
                      Ingredients needed
                      <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                        {mealItems.length} items
                      </span>
                    </h3>
                  </div>
                  {Object.entries(mealSections).map(([section, items]) => (
                    <ShoppingSection key={section} section={section} items={items} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
