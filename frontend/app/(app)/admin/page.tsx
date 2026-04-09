"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, UserCheck, TrendingUp, Calendar, Flame, Target, RefreshCw } from "lucide-react";

interface Stats {
  total_users: number;
  new_today: number;
  new_this_week: number;
  onboarding_done: number;
  onboarding_rate: number;
  diet_breakdown: Record<string, number>;
  goal_breakdown: Record<string, number>;
  recent_signups: { email: string; name: string; joined: string }[];
}

const DIET_LABELS: Record<string, string> = {
  keto: "Keto",
  carnivore: "Carnivore",
  ketovore: "Ketovore",
  "not set": "Not set",
};

const GOAL_LABELS: Record<string, string> = {
  fat_loss: "Fat Loss",
  maintenance: "Maintenance",
  muscle_gain: "Muscle Gain",
  "not set": "Not set",
};

const DIET_COLORS: Record<string, string> = {
  keto: "#E8620A",
  carnivore: "#10B981",
  ketovore: "#8B5CF6",
  "not set": "#9CA3AF",
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="card rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-black mb-1" style={{ color: "var(--text)" }}>{value}</p>
      <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>{sub}</p>}
    </div>
  );
}

function BreakdownBar({ data, colors, labels }: {
  data: Record<string, number>; colors?: Record<string, string>; labels?: Record<string, string>;
}) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (!total) return <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data yet</p>;

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, count]) => {
        const pct = Math.round((count / total) * 100);
        const color = colors?.[key] || "var(--accent)";
        const label = labels?.[key] || key;
        return (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--text)" }}>{label}</span>
              <span style={{ color: "var(--text-muted)" }}>{count} users ({pct}%)</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-alt)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/stats");
      setStats(res.data);
      setLastRefresh(new Date());
    } catch {
      // not admin or error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
    </div>
  );

  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="text-4xl">🔒</div>
      <p className="font-bold" style={{ color: "var(--text)" }}>Accès refusé</p>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Cette page est réservée à l'administrateur.</p>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>Admin Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Dernière mise à jour : {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Utilisateurs total" value={stats.total_users} color="#E8620A" />
        <StatCard icon={TrendingUp} label="Nouveaux aujourd'hui" value={stats.new_today} color="#10B981" />
        <StatCard icon={Calendar} label="Nouveaux cette semaine" value={stats.new_this_week} color="#8B5CF6" />
        <StatCard
          icon={UserCheck}
          label="Onboarding complété"
          value={`${stats.onboarding_rate}%`}
          sub={`${stats.onboarding_done} / ${stats.total_users} users`}
          color="#F59E0B"
        />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Flame className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h2 className="font-bold" style={{ color: "var(--text)" }}>Régime alimentaire</h2>
          </div>
          <BreakdownBar data={stats.diet_breakdown} colors={DIET_COLORS} labels={DIET_LABELS} />
        </div>

        <div className="card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-5 h-5" style={{ color: "#8B5CF6" }} />
            <h2 className="font-bold" style={{ color: "var(--text)" }}>Objectifs</h2>
          </div>
          <BreakdownBar
            data={stats.goal_breakdown}
            colors={{ fat_loss: "#E8620A", maintenance: "#10B981", muscle_gain: "#8B5CF6", "not set": "#9CA3AF" }}
            labels={GOAL_LABELS}
          />
        </div>
      </div>

      {/* Recent signups */}
      <div className="card rounded-2xl p-6">
        <h2 className="font-bold mb-5" style={{ color: "var(--text)" }}>
          Dernières inscriptions
        </h2>
        {stats.recent_signups.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune inscription encore.</p>
        ) : (
          <div className="space-y-3">
            {stats.recent_signups.map((u, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border-light)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "var(--accent)" }}>
                    {(u.name || u.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {u.name || "—"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {u.joined ? new Date(u.joined).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
