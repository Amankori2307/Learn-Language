/* eslint-disable react-refresh/only-export-components */
import Link from "next/link";
import type { Metadata } from "next";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import { getTopPublicTopics } from "@shared/domain/public-seo-content";
import { PublicBreadcrumbs, PublicPageFooter } from "../_components/public-page-seo";

const routeSeo = getSeoRouteDefinition("/topics");
const topics = getTopPublicTopics(10);

export const metadata: Metadata = routeSeo
  ? {
      title: { absolute: routeSeo.title },
      description: routeSeo.description,
      alternates: { canonical: "/topics" },
      openGraph: {
        url: `${APP_SITE_URL}/topics`,
        title: routeSeo.title,
        description: routeSeo.description,
      },
      twitter: {
        title: routeSeo.title,
        description: routeSeo.description,
      },
    }
  : {};

export default function TopicsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8 md:py-24">
        <PublicBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Topics", href: "/topics" },
          ]}
        />
        <div className="max-w-3xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Public Topics
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Vocabulary topics learners practice most often.
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            These public topic summaries expose the study areas already represented in the app’s
            seed content, from greetings and daily-use language to verbs, nouns, and time phrases.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {topics.map((topic) => (
            <article key={topic.slug} className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold capitalize">{topic.slug.replaceAll("-", " ")}</h2>
                <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                  {topic.wordCount} words
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{topic.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/languages/telugu"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Explore Telugu
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start learning
          </Link>
        </div>
      </section>
      <PublicPageFooter />
    </main>
  );
}
