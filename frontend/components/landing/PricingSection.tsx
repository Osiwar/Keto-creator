"use client";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  { name: "Free", price: "0", period: "forever", description: "Discover keto with AI", features: ["1 week meal plan", "Basic macro calculator", "Shopping list", "5 AI coach messages/day"], cta: "Start free", href: "/register", highlight: false, comingSoon: false },
  { name: "Pro", price: "14", period: "month", description: "The full keto experience", features: ["Unlimited weekly plans", "Full macro tracking", "Unlimited AI coach", "Instant meal swaps", "Progress analytics", "Keto & carnivore modes"], cta: "Start 7-day free trial", href: "/register?plan=pro", highlight: true, badge: "Most Popular", comingSoon: false },
  { name: "Elite", price: "29", period: "month", description: "For the committed", features: ["Everything in Pro", "Custom meal creation", "Advanced analytics", "Priority support", "Export PDF plans", "Family mode (4 profiles)"], cta: "Coming Soon", href: "#", highlight: false, badge: "Coming Soon", comingSoon: true },
];

function PlanCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-3xl p-8 flex flex-col ${plan.highlight ? "" : "card"} ${plan.comingSoon ? "opacity-75" : ""}`}
      style={plan.highlight ? {
        background: "linear-gradient(160deg, #E8620A 0%, #C4500A 100%)",
        boxShadow: "0 12px 48px rgba(232,98,10,0.35)",
      } : {}}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="flex items-center gap-1 text-xs font-bold px-4 py-1.5 rounded-full"
            style={plan.comingSoon
              ? { background: "#6B7280", color: "#fff" }
              : { background: "var(--text)", color: "#fff" }
            }
          >
            <Zap className="w-3 h-3" /> {plan.badge}
          </span>
        </div>
      )}
      <div className="mb-7">
        <h3 className="text-lg font-bold mb-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.75)" : "var(--text-muted)" }}>{plan.name}</h3>
        <p className="text-sm mb-5" style={{ color: plan.highlight ? "rgba(255,255,255,0.65)" : "var(--text-muted)" }}>{plan.description}</p>
        <div className="flex items-end gap-1">
          <span className="text-5xl font-black" style={{ color: plan.highlight ? "#fff" : "var(--text)" }}>{plan.price}€</span>
          <span className="mb-1.5 text-sm" style={{ color: plan.highlight ? "rgba(255,255,255,0.65)" : "var(--text-muted)" }}>/{plan.period}</span>
        </div>
      </div>
      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm" style={{ color: plan.highlight ? "rgba(255,255,255,0.9)" : "var(--text-muted)" }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: plan.highlight ? "rgba(255,255,255,0.2)" : "var(--accent-light)" }}>
              <Check className="w-3 h-3 font-black" style={{ color: plan.highlight ? "#fff" : "var(--accent)" }} strokeWidth={3} />
            </div>
            {f}
          </li>
        ))}
      </ul>
      {plan.comingSoon ? (
        <button
          disabled
          className="w-full py-3.5 rounded-xl font-bold text-sm cursor-not-allowed"
          style={{ background: "#E5E7EB", color: "#9CA3AF" }}
        >
          Coming Soon
        </button>
      ) : (
        <Link href={plan.href}>
          <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${plan.highlight ? "bg-white text-orange-600 hover:bg-orange-50" : "btn-primary justify-center"}`}>
            {plan.cta}
          </button>
        </Link>
      )}
    </motion.div>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="section-label mx-auto w-fit">Pricing</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--text)" }}>Simple, honest pricing</h2>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>No hidden fees. Cancel anytime. Start free.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => <PlanCard key={plan.name} plan={plan} index={i} />)}
        </div>
      </div>
    </section>
  );
}
