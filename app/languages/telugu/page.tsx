/* eslint-disable react-refresh/only-export-components */
import Link from "next/link";
import type { Metadata } from "next";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import {
  getPublicLanguagePage,
  getSampleWordsForLanguage,
  getTopClustersForLanguage,
} from "@shared/domain/public-seo-content";
import { PublicBreadcrumbs, PublicPageFooter } from "../../_components/public-page-seo";

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
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 md:py-24">
        <PublicBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Learn Telugu", href: "/languages/telugu" },
          ]}
        />
        <div className="max-w-3xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Public Language Page
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {languagePage?.title ?? "Learn Telugu"}
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            {languagePage?.hero}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Sample Telugu words</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              These examples come from the public seed content currently used by the app.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {sampleWords.map((word) => (
                <article key={`${word.originalScript}-${word.english}`} className="rounded-2xl border border-border/50 bg-background p-4">
                  <p className="text-xl font-semibold">{word.originalScript}</p>
                  <p className="mt-1 text-sm italic text-muted-foreground">{word.transliteration}</p>
                  <p className="mt-2 text-sm text-foreground/90">{word.english}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-muted/40 p-8">
            <h2 className="text-2xl font-semibold">High-frequency Telugu topics</h2>
            <div className="mt-6 space-y-3">
              {topClusters.map((cluster) => (
                <article key={cluster.slug} className="rounded-2xl border border-border/50 bg-background/85 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold capitalize">{cluster.slug.replaceAll("-", " ")}</h3>
                    <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                      {cluster.wordCount} words
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{cluster.description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/topics"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Browse vocabulary topics
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start learning Telugu
          </Link>
        </div>
      </section>
      <PublicPageFooter />
    </main>
  );
}
