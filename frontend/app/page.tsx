import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import MacroCalculator from "@/components/landing/MacroCalculator";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import NewsletterSection from "@/components/landing/NewsletterSection";
import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "KetoCoach — AI Keto & Carnivore Meal Planner",
  description:
    "Your AI-powered keto and carnivore meal planner. Get personalized weekly meal plans, track your macros, and get 24/7 coaching from your personal AI nutrition coach.",
  alternates: { canonical: "https://keto-coach.app" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KetoCoach",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  url: "https://keto-coach.app",
  description:
    "AI-powered keto and carnivore meal planner with personalized weekly plans, macro tracking, and 24/7 AI nutrition coaching.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to get started",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "312",
  },
  featureList: [
    "Personalized keto meal plans",
    "Carnivore diet support",
    "AI nutrition coach",
    "Macro tracking",
    "Shopping list generator",
    "Allergy management",
  ],
};

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MacroCalculator />
      <TestimonialsSection />
      <PricingSection />
      <NewsletterSection />

      {/* Final CTA */}
      <section className="py-28 px-6 text-center relative overflow-hidden" style={{ background: "linear-gradient(160deg, #FFF8F2 0%, var(--bg-alt) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FFD4B2 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="section-label mx-auto w-fit mb-6">Ready to start?</div>
          <h2 className="text-4xl md:text-5xl font-black mb-5" style={{ color: "var(--text)" }}>
            Start your keto transformation today
          </h2>
          <p className="text-lg mb-10" style={{ color: "var(--text-muted)" }}>
            Join thousands who've ditched the guesswork and finally made keto work for them.
          </p>
          <Link href="/register">
            <button className="btn-primary text-lg px-10 py-5">
              Get started for free <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <p className="text-sm mt-4" style={{ color: "var(--text-light)" }}>No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6" style={{ background: "var(--bg)", borderColor: "var(--border-light)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8620A, #C4500A)" }}>
              <Flame className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold" style={{ color: "var(--text)" }}>KetoCoach</span>
          </Link>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>© 2026 KetoCoach. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
