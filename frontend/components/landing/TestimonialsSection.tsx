"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Marc D.", role: "Lost 18kg on keto", avatar: "M", color: "#E8620A", text: "I was always confused about what to eat on keto. KetoCoach generates my whole week in seconds. The AI coach helped me break my 3-week plateau — it identified I wasn't eating enough fat.", stars: 5 },
  { name: "Sophie R.", role: "Carnivore 6 months", avatar: "S", color: "#8B5CF6", text: "The carnivore mode is exactly what I needed. Every single meal is zero-carb. The shopping list saves me so much time — I just pull it up on my phone at the supermarket.", stars: 5 },
  { name: "Thomas B.", role: "Keto athlete", avatar: "T", color: "#059669", text: "As a CrossFit athlete, hitting enough protein on keto was my struggle. KetoCoach adjusted my macros for performance and the meal plans are actually delicious. Worth every cent.", stars: 5 },
  { name: "Emma L.", role: "Type 2 diabetes managed", avatar: "E", color: "#0284C7", text: "My doctor recommended keto for my blood sugar. KetoCoach makes it so accessible. I just follow the plan — no counting, no confusion. My A1C has improved dramatically.", stars: 5 },
];

function TestimonialCard({ t, index }: { t: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="card p-7 relative"
    >
      <Quote className="absolute top-6 right-6 w-8 h-8 opacity-8" style={{ color: t.color, opacity: 0.08 }} />
      <div className="flex gap-0.5 mb-4">
        {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
      </div>
      <p className="text-base leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>"{t.text}"</p>
      <div className="flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--border-light)" }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}AA)` }}>
          {t.avatar}
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: "var(--text)" }}>{t.name}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-28 px-6" style={{ background: "var(--bg-alt)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="section-label mx-auto w-fit">Testimonials</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--text)" }}>Real people, real results</h2>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>Join thousands who've finally made keto work for them.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => <TestimonialCard key={t.name} t={t} index={i} />)}
        </div>
      </div>
    </section>
  );
}
