import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/meal-plan", "/shopping", "/coach", "/onboarding"],
      },
    ],
    sitemap: "https://keto-coach.app/sitemap.xml",
  };
}
