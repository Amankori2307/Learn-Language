/* eslint-disable react-refresh/only-export-components */
import Link from "next/link";
import type { Metadata } from "next";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import { PublicBreadcrumbs, PublicPageFooter } from "../_components/public-page-seo";

const routeSeo = getSeoRouteDefinition("/features");

export const metadata: Metadata = routeSeo
  ? {
      title: { absolute: routeSeo.title },
      description: routeSeo.description,
      alternates: { canonical: "/features" },
      openGraph: {
        url: `${APP_SITE_URL}/features`,
        title: routeSeo.title,
        description: routeSeo.description,
      },
      twitter: {
        title: routeSeo.title,
        description: routeSeo.description,
      },
    }
  : {};

const featureSections = [
  {
    title: "Adaptive review sessions",
    body: "Daily review, new-word learning, weak-word recovery, cluster drills, and mixed workouts keep the next action obvious instead of leaving learners to guess what to study.",
  },
  {
    title: "Pronunciation-aware study",
    body: "Questions can pair source text, transliteration, listening prompts, and audio-backed answers so practice goes beyond silent recognition.",
  },
  {
    title: "Progress visibility",
    body: "Dashboard, analytics, leaderboards, and word buckets help learners see momentum, weak areas, and review priorities in one signed-in workflow.",
  },
  {
    title: "Reviewer-governed content quality",
    body: "Vocabulary submission, moderation, and conflict resolution workflows keep the learning dataset consistent as content expands.",
  },
] as const;

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8 md:py-24">
        <PublicBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Features", href: "/features" },
          ]}
        />
        <div className="max-w-3xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Product Features
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Language learning features built for retention, not just repetition.
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Learn-Lang combines adaptive review, pronunciation support, analytics, and reviewer
            governance into one product surface for structured vocabulary practice.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {featureSections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            See how it works
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Start learning
          </Link>
        </div>
      </section>
      <PublicPageFooter />
    </main>
  );
}
