"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";

const MEALS = [
  { name: "Ribeye & Eggs", cal: "780 kcal", tag: "Carnivore", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400", delay: 0 },
  { name: "Salmon Avocado", cal: "590 kcal", tag: "Keto", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400", delay: 0.15 },
  { name: "Bacon & Egg Bowl", cal: "620 kcal", tag: "Carnivore", img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400", delay: 0.3 },
];

function FloatingMealCard({ meal, index }: { meal: typeof MEALS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6 + meal.delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ animationDelay: `${meal.delay}s` }}
      className="animate-float"
    >
      <div className="card p-3 w-52" style={{ animationDuration: `${6 + index * 1.5}s` }}>
        <img src={meal.img} alt={meal.name} className="w-full h-28 object-cover rounded-xl mb-3" />
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{meal.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{meal.cal}</p>
          </div>
          <span className="tag text-[10px]">{meal.tag}</span>
        </div>
      </div>
    </motion.div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, to]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20" style={{ background: "linear-gradient(160deg, #FFF8F2 0%, #FDFAF5 40%, #F7F2EA 100%)" }}>

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, #FFD4B2 0%, transparent 70%)" }} />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FFE8CC 0%, transparent 70%)" }} />
        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-40"
            style={{
              background: i % 2 === 0 ? "#E8620A" : "#F59E0B",
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left — Text */}
        <motion.div style={{ y, opacity }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-label mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Nutrition Coach
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] mb-6"
            style={{ color: "var(--text)" }}
          >
            Your personal{" "}
            <span className="gradient-text">AI chef</span>
            {" "}for the{" "}
            <span className="gradient-text">keto lifestyle</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl leading-relaxed mb-6 max-w-lg"
            style={{ color: "var(--text-muted)" }}
          >
            Personalized weekly meal plans, automatic macro tracking, and a 24/7 AI nutrition coach — built exclusively for keto and carnivore.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            <Link href="/register">
              <motion.button className="btn-primary text-base px-8 py-4" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Start for free <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <a href="#how-it-works">
              <button className="btn-outline text-base px-8 py-4">See my macros</button>
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {["#F59E0B","#E8620A","#10B981","#8B5CF6","#06B6D4"].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white" style={{ background: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text)" }}>2,400+ members</strong> already on plan
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right — Floating cards */}
        <div className="hidden lg:flex flex-col items-center gap-5 relative">
          <div className="flex gap-5 items-end">
            <FloatingMealCard meal={MEALS[0]} index={0} />
            <FloatingMealCard meal={MEALS[1]} index={1} />
          </div>
          <FloatingMealCard meal={MEALS[2]} index={2} />

          {/* Macro badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="absolute -left-8 top-1/2 card px-4 py-3 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: "linear-gradient(135deg, #E8620A, #F59E0B)" }}>F</div>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--text)" }}>Daily Fat</p>
              <p className="text-lg font-black gradient-text">172g</p>
            </div>
          </motion.div>

          {/* AI badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
            className="absolute -right-4 bottom-8 card px-4 py-3"
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>AI Coach says</p>
            <p className="text-sm font-bold" style={{ color: "var(--text)" }}>You're on track! 🔥</p>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 border-t py-6"
        style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)", borderColor: "var(--border-light)" }}
      >
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-12">
          {[
            { value: 22, suffix: "+", label: "Keto meals in library" },
            { value: 14, suffix: "€/mo", label: "Full access" },
            { value: 100, suffix: "%", label: "Keto & carnivore optimized" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black gradient-text">
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
