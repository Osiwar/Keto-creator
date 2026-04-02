"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Eye, EyeOff, Check } from "lucide-react";
import api from "@/lib/api";

const PERKS = ["Personalized weekly meal plans", "Unlimited AI nutrition coach", "Auto-generated shopping lists", "Macro tracking & progress"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/register", form);
      localStorage.setItem("keto_token", res.data.access_token);
      localStorage.setItem("keto_user", JSON.stringify(res.data.user));
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #FFF0E6 0%, #FFE4CC 100%)" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(232,98,10,0.12) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}>
              <Flame className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-bold text-xl" style={{ color: "var(--text)" }}>KetoCoach</span>
          </div>
          <h2 className="text-3xl font-black mb-3" style={{ color: "var(--text)" }}>Everything you need to succeed on keto</h2>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>Create your free account and get your first meal plan in minutes.</p>
          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent-light)" }}>
                  <Check className="w-3 h-3" style={{ color: "var(--accent)" }} strokeWidth={3} />
                </div>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text)" }}>Create your account</h1>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>Already have one? <Link href="/login" className="font-semibold" style={{ color: "var(--accent)" }}>Sign in</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pr-12" placeholder="Min 8 characters" minLength={8} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm p-3 rounded-xl" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                {error}
              </motion.div>
            )}
            <motion.button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Create free account →"}
            </motion.button>
            <p className="text-xs text-center" style={{ color: "var(--text-light)" }}>No credit card required. Free forever plan available.</p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
