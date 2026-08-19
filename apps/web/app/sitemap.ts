import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lumiqs-ai-mvp-web.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/pricing", "/contact", "/help", "/faq", "/privacy", "/terms", "/cookies", "/acceptable-use", "/code-of-conduct", "/ai-policy", "/disclaimer", "/security"];
  return routes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : 0.6 }));
}
