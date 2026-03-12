/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import { PublicPageShell } from "./_components/public-site";
import { HomeMainContent } from "./_components/home-main";

const homeSeo = getSeoRouteDefinition("/");

export const metadata: Metadata = homeSeo
  ? {
      title: {
        absolute: homeSeo.title,
      },
      description: homeSeo.description,
      alternates: {
        canonical: "/",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
        },
      },
      openGraph: {
        url: APP_SITE_URL,
        title: homeSeo.title,
        description: homeSeo.description,
      },
      twitter: {
        title: homeSeo.title,
        description: homeSeo.description,
      },
    }
  : {};

export default function HomePage() {
  return (
    <PublicPageShell>
      <HomeMainContent />
    </PublicPageShell>
  );
}
