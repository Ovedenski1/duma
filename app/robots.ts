import type { MetadataRoute } from "next";

const siteUrl = "https://dumichki.bg";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/login", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}