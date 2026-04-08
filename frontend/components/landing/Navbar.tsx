"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Flame, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "Calculator" },
  { href: "#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
      style={{
        background: scrolled ? "rgba(253,250,245,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-light)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(28,10,0,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}>
            <Flame className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-bold text-xl" style={{ color: "var(--text)" }}>KetoCoach</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            l.href.startsWith("/") ? (
              <Link key={l.href} href={l.href} className="text-sm font-medium transition-colors hover:text-orange-600" style={{ color: "var(--text-muted)" }}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="text-sm font-medium transition-colors hover:text-orange-600" style={{ color: "var(--text-muted)" }}>
                {l.label}
              </a>
            )
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <button className="btn-ghost text-sm py-2.5 px-5">Sign in</button>
          </Link>
          <Link href="/register">
            <motion.button className="btn-primary text-sm py-2.5 px-6" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Start Free
            </motion.button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: "var(--text)" }}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden px-6 pb-6 pt-2 border-t"
          style={{ background: "var(--bg)", borderColor: "var(--border-light)" }}
        >
          {NAV_LINKS.map((l) => (
            l.href.startsWith("/") ? (
              <Link key={l.href} href={l.href} className="block py-3 text-sm font-medium" style={{ color: "var(--text-muted)" }} onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="block py-3 text-sm font-medium" style={{ color: "var(--text-muted)" }} onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            )
          ))}
          <div className="flex gap-3 mt-4">
            <Link href="/login" className="flex-1"><button className="btn-ghost w-full text-sm py-2.5">Sign in</button></Link>
            <Link href="/register" className="flex-1"><button className="btn-primary w-full text-sm py-2.5 justify-center">Start Free</button></Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
