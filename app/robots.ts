import type { MetadataRoute } from "next";
import { APP_PROTECTED_ROUTES, APP_SITE_URL } from "@shared/domain/constants/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/auth"],
      disallow: ["/api/", ...APP_PROTECTED_ROUTES.filter((route) => route !== "/")],
    },
    sitemap: `${APP_SITE_URL}/sitemap.xml`,
    host: APP_SITE_URL,
  };
}
