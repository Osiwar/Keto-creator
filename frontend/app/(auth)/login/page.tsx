"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("keto_token", res.data.access_token);
      localStorage.setItem("keto_user", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #FFF0E6 0%, #FFE4CC 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(232,98,10,0.15) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-sm text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)", boxShadow: "0 8px 32px rgba(232,98,10,0.4)" }}>
            <Flame className="w-10 h-10 text-white" fill="white" />
          </div>
          <h2 className="text-3xl font-black mb-3" style={{ color: "var(--text)" }}>Welcome back</h2>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>Your personalized keto meal plan is waiting. Sign in to continue your journey.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}>
              <Flame className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-bold text-xl" style={{ color: "var(--text)" }}>KetoCoach</span>
          </Link>

          <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text)" }}>Sign in</h1>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>Don't have an account? <Link href="/register" className="font-semibold" style={{ color: "var(--accent)" }}>Sign up free</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-sm p-3 rounded-xl" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                {error}
              </motion.div>
            )}
            <motion.button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Sign in"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
