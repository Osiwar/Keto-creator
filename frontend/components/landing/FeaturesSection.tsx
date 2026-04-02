"use client";
import { motion } from "framer-motion";
import { Calendar, Brain, ShoppingCart, TrendingUp, Zap, Shield } from "lucide-react";

const features = [
  { icon: Calendar, title: "Weekly Meal Plans", description: "AI generates a complete 7-day plan tailored to your macros, preferences, and budget. Refreshed every week automatically.", color: "#E8620A", bg: "#FFF0E6" },
  { icon: Brain, title: "AI Nutrition Coach", description: "Ask anything about keto, troubleshoot plateaus, get recipe substitutions. Your 24/7 coach that knows your full profile.", color: "#8B5CF6", bg: "#F3F0FF" },
  { icon: ShoppingCart, title: "Smart Shopping Lists", description: "Instant grocery lists from your weekly plan, sorted by store section. Never forget an ingredient again.", color: "#059669", bg: "#ECFDF5" },
  { icon: TrendingUp, title: "Macro Tracking", description: "Visual progress rings show your fat, protein and carb targets at a glance. Mark meals eaten to update in real time.", color: "#0284C7", bg: "#E0F2FE" },
  { icon: Zap, title: "Instant Meal Swaps", description: "Don't like tonight's dinner? Swap it with one tap. The AI suggests alternatives that keep your macros on track.", color: "#D97706", bg: "#FFFBEB" },
  { icon: Shield, title: "Strictly Keto & Carnivore", description: "Zero compromises. Every meal is 100% keto-compliant. Carnivore mode removes all plant foods entirely.", color: "#DC2626", bg: "#FEF2F2" },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="card p-6 cursor-default"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: feature.bg }}>
        <Icon className="w-6 h-6" style={{ color: feature.color }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>{feature.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{feature.description}</p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="section-label mx-auto w-fit">Everything you need</div>
          <h2 className="text-4xl md:text-5xl font-black mb-5" style={{ color: "var(--text)" }}>
            Your complete keto toolkit
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
            From meal planning to macro tracking — everything in one beautiful, intuitive app.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
        </div>
      </div>
    </section>
  );
}
