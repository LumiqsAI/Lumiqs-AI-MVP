import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lumiqs-ai-mvp-web.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/pricing", "/contact", "/help", "/faq", "/privacy", "/terms", "/cookies", "/acceptable-use", "/code-of-conduct", "/ai-policy", "/disclaimer", "/security"], disallow: ["/dashboard", "/businesses", "/settings"] }, sitemap: `${baseUrl}/sitemap.xml` };
}
