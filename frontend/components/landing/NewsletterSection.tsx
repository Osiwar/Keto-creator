"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Sparkles, CheckCircle } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #1A0A00 0%, #2D1200 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(232,98,10,0.3) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-semibold"
          style={{
            background: "rgba(232,98,10,0.2)",
            border: "1px solid rgba(232,98,10,0.4)",
            color: "#FFA05C",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Limited offer
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-3xl md:text-4xl font-black mb-3"
          style={{ color: "#FFFFFF" }}
        >
          Get 50% off your first month
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base mb-8 leading-relaxed"
          style={{ color: "#D1A882" }}
        >
          Subscribe to our newsletter and receive an exclusive promo code
          directly in your inbox. Keto tips, recipes &amp; exclusive deals every week.
        </motion.p>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "rgba(16,185,129,0.15)" }}
              >
                <CheckCircle className="w-7 h-7" style={{ color: "#10B981" }} />
              </div>
              <p className="font-bold text-lg" style={{ color: "#FFFFFF" }}>
                You're in! Check your inbox.
              </p>
              <p className="text-sm" style={{ color: "#D1A882" }}>
                Your exclusive promo code has been sent to your inbox.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9CA3AF" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#FFFFFF",
                  }}
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 rounded-xl font-bold text-sm text-white flex-shrink-0 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Get 50% off →"
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-3 text-sm" style={{ color: "#F87171" }}>
            {error}
          </p>
        )}

        <p className="mt-4 text-xs" style={{ color: "#6B7280" }}>
          No spam · Unsubscribe anytime · Offer valid for 1 month
        </p>
      </div>
    </section>
  );
}
