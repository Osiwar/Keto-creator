"use client";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame, Eye, EyeOff, CheckCircle } from "lucide-react";
import api from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid or expired link. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-2xl text-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#ECFDF5" }}>
          <CheckCircle className="w-7 h-7" style={{ color: "#10B981" }} />
        </div>
        <h2 className="font-bold text-lg mb-2" style={{ color: "var(--text)" }}>Password updated!</h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Redirecting you to sign in…</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          New password
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field pr-12"
            placeholder="At least 8 characters"
            required
            disabled={!token}
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          Confirm password
        </label>
        <input
          type={showPw ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input-field"
          placeholder="••••••••"
          required
          disabled={!token}
        />
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm p-3 rounded-xl"
          style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
        >
          {error}
          {!token && (
            <span> <Link href="/forgot-password" style={{ color: "#DC2626", fontWeight: 700 }}>Request a new link</Link>.</span>
          )}
        </motion.div>
      )}
      <motion.button
        type="submit"
        disabled={loading || !token}
        className="btn-primary w-full justify-center py-4 text-base"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          "Set new password"
        )}
      </motion.button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}>
          <Flame className="w-6 h-6 text-white" fill="white" />
        </div>

        <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text)" }}>Set new password</h1>
        <p className="mb-8" style={{ color: "var(--text-muted)" }}>
          Choose a strong password for your account.
        </p>

        <Suspense fallback={<div className="h-40" />}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
