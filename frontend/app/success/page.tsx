"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";

export default function SuccessPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black mb-3"
            style={{ color: "var(--text)" }}
          >
            Welcome to Pro! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            Your subscription is active. Enjoy unlimited meal plans, AI coaching,
            and all Pro features.
          </motion.p>

          {/* Features reminder */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-6 mb-8 text-left"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <span className="font-bold text-sm" style={{ color: "var(--text)" }}>
                Now unlocked
              </span>
            </div>
            {[
              "Unlimited weekly meal plans",
              "Unlimited AI Coach messages",
              "Instant meal swaps",
              "Full macro tracking",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 py-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--accent)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {f}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/dashboard">
              <button
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 text-lg"
                style={{
                  background: "linear-gradient(135deg, #E8620A, #C4500A)",
                  boxShadow: "0 8px 24px rgba(232,98,10,0.35)",
                }}
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
