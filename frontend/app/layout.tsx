import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

const SITE_URL = "https://keto-coach.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KetoCoach — AI Keto & Carnivore Meal Planner",
    template: "%s | KetoCoach",
  },
  description:
    "Your AI-powered keto and carnivore meal planner. Get personalized weekly meal plans, track your macros, and get 24/7 coaching from your personal AI nutrition coach.",
  keywords: [
    "keto meal planner",
    "carnivore diet",
    "AI nutrition coach",
    "ketogenic diet",
    "keto meal plan",
    "low carb diet",
    "macro tracking",
    "keto recipes",
    "carnivore meal plan",
    "keto coach",
  ],
  authors: [{ name: "KetoCoach" }],
  creator: "KetoCoach",
  publisher: "KetoCoach",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "KetoCoach",
    title: "KetoCoach — AI Keto & Carnivore Meal Planner",
    description:
      "Personalized weekly meal plans, macro tracking, and a 24/7 AI nutrition coach. Finally make keto work for you.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KetoCoach — AI Keto & Carnivore Meal Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KetoCoach — AI Keto & Carnivore Meal Planner",
    description:
      "Personalized weekly meal plans, macro tracking, and a 24/7 AI nutrition coach.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
