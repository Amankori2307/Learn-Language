import type { MetadataRoute } from "next";
import { APP_SITE_URL, SEO_ROUTE_DEFINITIONS } from "@shared/domain/constants/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return SEO_ROUTE_DEFINITIONS.filter((route) => route.index).map((route) => ({
    url: `${APP_SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
