/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import NextSpaRoot from "../../client/src/next-spa-root";
import {
  APP_BRAND_NAME,
} from "@shared/domain/constants/app-brand";
import {
  APP_DEFAULT_DESCRIPTION,
  APP_SITE_URL,
  getSeoRouteDefinition,
} from "@shared/domain/constants/seo";

export const dynamic = "force-dynamic";

function normalizeRoutePath(slug?: string[]) {
  if (!slug || slug.length === 0) {
    return "/";
  }
  return `/${slug.join("/")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const routePath = normalizeRoutePath(resolvedParams.slug);
  const routeMetadata = getSeoRouteDefinition(routePath);

  if (!routeMetadata) {
    return {
      title: `Not Found | ${APP_BRAND_NAME}`,
      description: APP_DEFAULT_DESCRIPTION,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: {
      absolute: routeMetadata.title,
    },
    description: routeMetadata.description,
    alternates: {
      canonical: routeMetadata.index ? routePath : undefined,
    },
    robots: {
      index: routeMetadata.index,
      follow: routeMetadata.index,
      googleBot: {
        index: routeMetadata.index,
        follow: routeMetadata.index,
        "max-snippet": routeMetadata.index ? -1 : 0,
        "max-image-preview": routeMetadata.index ? "large" : "none",
        "max-video-preview": routeMetadata.index ? -1 : 0,
      },
    },
    openGraph: {
      url: routeMetadata.index ? `${APP_SITE_URL}${routePath}` : APP_SITE_URL,
      title: routeMetadata.title,
      description: routeMetadata.description,
    },
    twitter: {
      title: routeMetadata.title,
      description: routeMetadata.description,
    },
  };
}

export default function SpaPage() {
  return <NextSpaRoot />;
}
