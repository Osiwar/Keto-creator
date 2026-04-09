"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, ArrowLeft, Mail } from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link href="/login" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}>
          <Flame className="w-6 h-6 text-white" fill="white" />
        </div>

        <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text)" }}>Forgot password?</h1>
        <p className="mb-8" style={{ color: "var(--text-muted)" }}>
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#ECFDF5" }}>
              <Mail className="w-7 h-7" style={{ color: "#10B981" }} />
            </div>
            <h2 className="font-bold text-lg mb-2" style={{ color: "var(--text)" }}>Check your inbox</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              If <strong>{email}</strong> is registered, you'll receive a reset link shortly. The link expires in 30 minutes.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
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
              </motion.div>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-4 text-base"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Send reset link"
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
