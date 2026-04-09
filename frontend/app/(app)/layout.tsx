"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, LayoutDashboard, Calendar, ShoppingCart, MessageCircle, LogOut, Menu, X, UserCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meal-plan", label: "Meal Plan", icon: Calendar },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart },
  { href: "/coach", label: "AI Coach", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("keto_token");
    if (!token) { router.push("/login"); return; }
    const u = localStorage.getItem("keto_user");
    if (u) setUser(JSON.parse(u));
  }, [router]);

  const logout = () => {
    localStorage.removeItem("keto_token");
    localStorage.removeItem("keto_user");
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 p-5 border-r" style={{ background: "var(--surface)", borderColor: "var(--border-light)" }}>
        <Link href="/" className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}>
            <Flame className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text)" }}>KetoCoach</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={active ? {
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                  } : {
                    color: "var(--text-muted)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          {user && (
            <div className="rounded-xl p-3 border" style={{ background: "var(--bg-alt)", borderColor: "var(--border-light)" }}>
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{user.full_name || user.email}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl w-full transition-colors hover:bg-red-50"
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b" style={{ background: "rgba(253,250,245,0.95)", backdropFilter: "blur(12px)", borderColor: "var(--border-light)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}>
            <Flame className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="font-bold" style={{ color: "var(--text)" }}>KetoCoach</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} style={{ color: "var(--text-muted)" }}>
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <motion.div initial={{ x: -280 }} animate={{ x: 0 }} className="relative w-64 h-full border-r p-5 flex flex-col" style={{ background: "var(--surface)", borderColor: "var(--border-light)" }}>
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold" style={{ color: "var(--text)" }}>KetoCoach</span>
              <button onClick={() => setMobileOpen(false)} style={{ color: "var(--text-muted)" }}><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={active ? { background: "var(--accent-light)", color: "var(--accent)" } : { color: "var(--text-muted)" }}>
                      <Icon className="w-4 h-4" />{item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14" style={{ background: "var(--bg)" }}>
        {children}
      </main>
    </div>
  );
}
