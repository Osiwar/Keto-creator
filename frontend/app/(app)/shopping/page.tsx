"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronDown, ChevronUp, Zap, Check } from "lucide-react";
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

function ShoppingSection({ section, items, onToggle }: { section: string; items: any[]; onToggle: (id: number) => void }) {
  const [open, setOpen] = useState(true);
  const meta = SECTION_LABELS[section] || SECTION_LABELS.other;
  const checked = items.filter((i) => i.is_checked).length;

  return (
    <div className="rounded-2xl overflow-hidden mb-4 shadow-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 transition-colors hover:opacity-80"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{meta.emoji}</span>
          <span className="font-semibold" style={{ color: "var(--text)" }}>{meta.label}</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{checked}/{items.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {checked === items.length && items.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(16,185,129,0.15)", color: "#059669" }}>Done ✓</span>
          )}
          {open
            ? <ChevronUp className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            : <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          }
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => onToggle(item.id)}
                  className="w-full flex items-center gap-3 py-2 text-left"
                  whileHover={{ x: 2 }}
                >
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: item.is_checked ? meta.color : "var(--border)",
                      background: item.is_checked ? meta.color : "transparent",
                    }}
                  >
                    {item.is_checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span
                    className="text-sm flex-1"
                    style={{
                      color: item.is_checked ? "var(--text-muted)" : "var(--text)",
                      textDecoration: item.is_checked ? "line-through" : "none",
                    }}
                  >
                    {item.ingredient_name}
                  </span>
                  {(item.amount || item.unit) && (
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      {item.amount} {item.unit}
                    </span>
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

export default function ShoppingPage() {
  const [shoppingList, setShoppingList] = useState<any>(null);
  const [mealPlanId, setMealPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const weekStart = formatDate(getWeekStart());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const planRes = await api.get(`/meal-plans?week_start=${weekStart}`);
      setMealPlanId(planRes.data.id);
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

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
    </div>
  );

  const sections: Record<string, any[]> = {};
  if (shoppingList) {
    for (const item of shoppingList.items) {
      const sec = item.store_section || "other";
      if (!sections[sec]) sections[sec] = [];
      sections[sec].push(item);
    }
  }

  const totalItems = shoppingList?.items?.length || 0;
  const checkedItems = shoppingList?.items?.filter((i: any) => i.is_checked).length || 0;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--text)" }}>Shopping List</h1>
            {shoppingList && (
              <p className="mt-1" style={{ color: "var(--text-muted)" }}>{checkedItems}/{totalItems} items checked</p>
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
          <div className="mt-4 rounded-full h-2 overflow-hidden" style={{ background: "var(--border)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--accent)" }}
              animate={{ width: `${(checkedItems / totalItems) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </motion.div>

      {!mealPlanId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl p-10 text-center shadow-sm"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <ShoppingCart className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-muted)" }}>Generate a meal plan first, then come back to create your shopping list.</p>
        </motion.div>
      )}

      {mealPlanId && !shoppingList && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl p-10 text-center shadow-sm"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <ShoppingCart className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--accent)", opacity: 0.5 }} />
          <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text)" }}>No list yet</h3>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>Generate a shopping list from your current meal plan.</p>
          <motion.button
            onClick={generateList}
            className="px-8 py-3 rounded-2xl font-bold text-white shadow-md"
            style={{ background: "var(--accent)" }}
            whileHover={{ scale: 1.02 }}
          >
            Generate shopping list
          </motion.button>
        </motion.div>
      )}

      {shoppingList && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {Object.entries(sections).map(([section, items]) => (
            <ShoppingSection key={section} section={section} items={items} onToggle={toggleItem} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
