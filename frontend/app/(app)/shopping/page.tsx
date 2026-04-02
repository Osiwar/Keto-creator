"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronDown, ChevronUp, Zap, Check } from "lucide-react";
import api from "@/lib/api";
import { getWeekStart, formatDate } from "@/lib/utils";

const SECTION_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  meat: { label: "Meat & Poultry", emoji: "🥩", color: "#EF4444" },
  fish: { label: "Fish & Seafood", emoji: "🐟", color: "#06B6D4" },
  dairy: { label: "Dairy & Eggs", emoji: "🥚", color: "#F59E0B" },
  produce: { label: "Produce", emoji: "🥬", color: "#10B981" },
  pantry: { label: "Pantry", emoji: "🫙", color: "#8B5CF6" },
  other: { label: "Other", emoji: "🛒", color: "#6B7280" },
};

function ShoppingSection({ section, items, onToggle }: { section: string; items: any[]; onToggle: (id: number) => void }) {
  const [open, setOpen] = useState(true);
  const meta = SECTION_LABELS[section] || SECTION_LABELS.other;
  const checked = items.filter((i) => i.is_checked).length;

  return (
    <div className="glass rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{meta.emoji}</span>
          <span className="font-semibold text-white">{meta.label}</span>
          <span className="text-xs text-gray-500 ml-1">{checked}/{items.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {checked === items.length && items.length > 0 && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Done</span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
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
            <div className="px-4 pb-4 space-y-2 border-t border-white/6 pt-3">
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => onToggle(item.id)}
                  className="w-full flex items-center gap-3 py-2 group text-left"
                  whileHover={{ x: 2 }}
                >
                  <div
                    className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: item.is_checked ? meta.color : "rgba(255,255,255,0.2)",
                      background: item.is_checked ? meta.color : "transparent",
                    }}
                  >
                    {item.is_checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm flex-1 ${item.is_checked ? "line-through text-gray-600" : "text-gray-200"}`}>
                    {item.ingredient_name}
                  </span>
                  {(item.amount || item.unit) && (
                    <span className="text-xs text-gray-600 flex-shrink-0">
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

  useEffect(() => {
    loadData();
  }, []);

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
      items: prev.items.map((item: any) =>
        item.id === id ? { ...item, is_checked: !item.is_checked } : item
      ),
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  // Group items by section
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
            <h1 className="text-3xl font-black text-white">Shopping List</h1>
            {shoppingList && (
              <p className="text-gray-400 mt-1">{checkedItems}/{totalItems} items checked</p>
            )}
          </div>
          {mealPlanId && (
            <motion.button
              onClick={generateList}
              disabled={generating}
              className="btn-primary flex items-center gap-2 py-2.5 px-5"
              whileHover={{ scale: 1.02 }}
            >
              {generating
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <><Zap className="w-4 h-4" /> {shoppingList ? "Refresh" : "Generate"}</>
              }
            </motion.button>
          )}
        </div>

        {shoppingList && totalItems > 0 && (
          <div className="mt-4 bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }}
              animate={{ width: `${(checkedItems / totalItems) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </motion.div>

      {!mealPlanId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-10 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Generate a meal plan first, then come back to create your shopping list.</p>
        </motion.div>
      )}

      {mealPlanId && !shoppingList && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-10 text-center">
          <ShoppingCart className="w-12 h-12 text-amber-500/50 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">No list yet</h3>
          <p className="text-gray-400 mb-6">Generate a shopping list from your current meal plan.</p>
          <motion.button onClick={generateList} className="btn-primary px-8 py-3" whileHover={{ scale: 1.02 }}>
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
