import type { MetadataRoute } from "next";
import { APP_PUBLIC_ROUTES, APP_SITE_URL } from "@shared/domain/constants/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return APP_PUBLIC_ROUTES.map((route) => ({
    url: `${APP_SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/auth" ? "monthly" : "weekly",
    priority: route === "/auth" ? 0.6 : 0.7,
  }));
}
