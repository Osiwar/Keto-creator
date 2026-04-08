import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Clock, Tag, ArrowRight, Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Keto & Carnivore Blog — Tips, Guides & Meal Plans",
  description: "Expert guides on keto and carnivore diets. Learn how to calculate macros, break weight loss plateaus, and build the perfect meal plan.",
  alternates: { canonical: "https://keto-coach.app/blog" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Weight Loss": "#EF4444",
  "Diet Comparison": "#8B5CF6",
  "Meal Planning": "#10B981",
  "Nutrition": "#F59E0B",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <Flame className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--text)" }}>KetoCoach</span>
          </Link>
          <Link href="/register">
            <button className="btn-primary text-sm px-5 py-2.5">Start free</button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="section-label mx-auto w-fit mb-4">Blog</div>
        <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ color: "var(--text)" }}>
          Keto & Carnivore Guides
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Evidence-based guides to help you master keto, break plateaus, and build sustainable fat-burning habits.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article
                className="card rounded-2xl overflow-hidden h-full flex flex-col transition-all hover:-translate-y-1"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                {/* Category color bar */}
                <div className="h-1.5 w-full" style={{ background: CATEGORY_COLORS[post.category] || "var(--accent)" }} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Category + Read time */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      <Clock className="w-3 h-3" />
                      {post.readTime} read
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold mb-2 leading-snug group-hover:text-orange-600 transition-colors"
                    style={{ color: "var(--text)" }}>
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm flex-1 leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                    {post.description}
                  </p>

                  {/* Read more */}
                  <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--accent)" }}>
                    Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="py-16 px-6 text-center" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <h2 className="text-2xl font-black mb-3" style={{ color: "var(--text)" }}>
          Ready to put this into practice?
        </h2>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>
          Get a personalized keto meal plan built around your exact goals and macros.
        </p>
        <Link href="/register">
          <button className="btn-primary px-8 py-4">Start for free — no credit card needed</button>
        </Link>
      </div>
    </div>
  );
}
