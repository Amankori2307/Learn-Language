/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import {
  getPublicLanguagePage,
  getSampleWordsForLanguage,
  getTopClustersForLanguage,
} from "@shared/domain/public-seo-content";
import {
  PublicActionLink,
  PublicActionRow,
  PublicCard,
  PublicIntro,
  PublicPageShell,
  PublicSection,
  PublicSurface,
} from "../../_components/public-site";

const routeSeo = getSeoRouteDefinition("/languages/telugu");
const languagePage = getPublicLanguagePage("telugu");
const sampleWords = getSampleWordsForLanguage("telugu", 6);
const topClusters = getTopClustersForLanguage("telugu", 6);

export const metadata: Metadata = routeSeo
  ? {
      title: { absolute: routeSeo.title },
      description: routeSeo.description,
      alternates: { canonical: "/languages/telugu" },
      openGraph: {
        url: `${APP_SITE_URL}/languages/telugu`,
        title: routeSeo.title,
        description: routeSeo.description,
      },
      twitter: {
        title: routeSeo.title,
        description: routeSeo.description,
      },
    }
  : {};

export default function TeluguLanguagePage() {
  return (
    <PublicPageShell>
      <PublicSection className="py-16 md:py-24">
        <PublicIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Learn Telugu", href: "/languages/telugu" },
          ]}
          eyebrow="Public Language Page"
          title={languagePage?.title ?? "Learn Telugu"}
          description={languagePage?.hero ?? ""}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <PublicSurface>
            <h2 className="text-2xl font-semibold">Sample Telugu words</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              These examples come from the public seed content currently used by the app.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {sampleWords.map((word) => (
                <PublicCard
                  key={`${word.originalScript}-${word.english}`}
                  className="rounded-2xl border-border/50 bg-background p-4 shadow-none"
                >
                  <p className="text-xl font-semibold">{word.originalScript}</p>
                  <p className="mt-1 text-sm italic text-muted-foreground">{word.transliteration}</p>
                  <p className="mt-2 text-sm text-foreground/90">{word.english}</p>
                </PublicCard>
              ))}
            </div>
          </PublicSurface>

          <PublicSurface className="bg-muted/40 shadow-none">
            <h2 className="text-2xl font-semibold">High-frequency Telugu topics</h2>
            <div className="mt-6 space-y-3">
              {topClusters.map((cluster) => (
                <PublicCard key={cluster.slug} className="rounded-2xl border-border/50 bg-background/85 p-4 shadow-none">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold capitalize">{cluster.slug.replaceAll("-", " ")}</h3>
                    <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                      {cluster.wordCount} words
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{cluster.description}</p>
                </PublicCard>
              ))}
            </div>
          </PublicSurface>
        </div>

        <PublicActionRow>
          <PublicActionLink href="/topics">Browse vocabulary topics</PublicActionLink>
          <PublicActionLink href="/auth" variant="primary">
            Start learning Telugu
          </PublicActionLink>
        </PublicActionRow>
      </PublicSection>
    </PublicPageShell>
  );
}
