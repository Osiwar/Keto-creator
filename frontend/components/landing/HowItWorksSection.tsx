"use client";
import { motion } from "framer-motion";
import { UserCircle, Zap, UtensilsCrossed, TrendingUp } from "lucide-react";

const steps = [
  { number: "01", icon: UserCircle, title: "Tell us about you", description: "5-minute setup: your diet type (keto or carnivore), goal, body metrics, budget and allergies. Our AI builds your full nutrition profile.", color: "#E8620A", bg: "#FFF0E6" },
  { number: "02", icon: Zap, title: "Get your plan instantly", description: "We generate a full 7-day meal plan with 3 meals per day, all hitting your exact macro targets. Done in seconds.", color: "#8B5CF6", bg: "#F3F0FF" },
  { number: "03", icon: UtensilsCrossed, title: "Cook, swap, repeat", description: "Follow the plan, swap any meal you don't like, mark meals as eaten. Your shopping list generates automatically.", color: "#059669", bg: "#ECFDF5" },
  { number: "04", icon: TrendingUp, title: "Track your progress", description: "Watch your macro rings fill daily. Chat with your AI coach anytime — about cravings, plateaus, or just what to eat tonight.", color: "#0284C7", bg: "#E0F2FE" },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="card p-7 flex gap-5"
    >
      <div className="flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: step.bg }}>
          <Icon className="w-7 h-7" style={{ color: step.color }} />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-black tracking-widest" style={{ color: step.color }}>{step.number}</span>
          <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{step.title}</h3>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{step.description}</p>
      </div>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="py-28 px-6" style={{ background: "var(--bg-alt)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="section-label mx-auto w-fit">How it works</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--text)" }}>Ready in under 5 minutes</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>No nutritionist needed. No spreadsheets. Just answer a few questions and get your plan.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, i) => <StepCard key={step.number} step={step} index={i} />)}
        </div>
      </div>
    </section>
  );
}
