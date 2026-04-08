import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { Clock, Tag, ArrowLeft, Flame, ArrowRight } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://keto-coach.app/blog/${params.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Weight Loss": "#EF4444",
  "Diet Comparison": "#8B5CF6",
  "Meal Planning": "#10B981",
  "Nutrition": "#F59E0B",
};

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const related = allPosts.filter((p) => p.slug !== params.slug).slice(0, 2);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
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

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>

        {/* Article header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <Clock className="w-3 h-3" />
              {post.readTime} read
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ color: "var(--text)" }}>
            {post.title}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {post.description}
          </p>
          <div className="h-1 w-16 rounded-full mt-6" style={{ background: CATEGORY_COLORS[post.category] || "var(--accent)" }} />
        </header>

        {/* Article content */}
        <article
          className="prose-keto"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{ color: "var(--text)" }}
        />

        {/* CTA Box */}
        <div className="mt-12 p-8 rounded-2xl text-center" style={{ background: "linear-gradient(160deg, #FFF4EC, #FFF8F2)", border: "1px solid var(--border)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent)" }}>
            <Flame className="w-6 h-6 text-white" fill="white" />
          </div>
          <h3 className="text-xl font-black mb-2" style={{ color: "var(--text)" }}>
            Get your personalized keto plan
          </h3>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            Your AI coach will build a custom meal plan based on your goals, body, and food preferences.
          </p>
          <Link href="/register">
            <button className="btn-primary px-7 py-3.5">
              Start free — no credit card <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text)" }}>More articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rel) => (
                <Link key={rel.slug} href={`/blog/${rel.slug}`} className="block group">
                  <div className="card p-5 rounded-xl hover:-translate-y-0.5 transition-all">
                    <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>{rel.category}</span>
                    <h3 className="font-bold text-sm mt-1 leading-snug group-hover:text-orange-600 transition-colors"
                      style={{ color: "var(--text)" }}>
                      {rel.title}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{rel.readTime} read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
