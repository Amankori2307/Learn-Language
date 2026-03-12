/* eslint-disable react-refresh/only-export-components */
import Link from "next/link";
import type { Metadata } from "next";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import { PublicBreadcrumbs, PublicPageFooter } from "../_components/public-page-seo";

const routeSeo = getSeoRouteDefinition("/how-it-works");

export const metadata: Metadata = routeSeo
  ? {
      title: { absolute: routeSeo.title },
      description: routeSeo.description,
      alternates: { canonical: "/how-it-works" },
      openGraph: {
        url: `${APP_SITE_URL}/how-it-works`,
        title: routeSeo.title,
        description: routeSeo.description,
      },
      twitter: {
        title: routeSeo.title,
        description: routeSeo.description,
      },
    }
  : {};

const steps = [
  {
    title: "1. Start with targeted review modes",
    body: "Learners can resume daily review, add new words, recover weak vocabulary, or practice by cluster instead of using one undifferentiated flashcard queue.",
  },
  {
    title: "2. Reinforce with pronunciation-aware prompts",
    body: "The app supports transliteration, listening modes, and answer audio so recall practice includes pronunciation context when available.",
  },
  {
    title: "3. Use analytics to choose the next drill",
    body: "Word buckets, history, and learning insights show what is improving, what is weak, and which session type should come next.",
  },
  {
    title: "4. Keep content quality governed",
    body: "Reviewer workflows make it possible to grow the vocabulary dataset without sacrificing consistency across examples, media, and definitions.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8 md:py-24">
        <PublicBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "How It Works", href: "/how-it-works" },
          ]}
        />
        <div className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            How It Works
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            A learning loop designed around recall quality and review timing.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Learn-Lang uses an adaptive loop: study what matters now, review what is drifting, and
            use analytics to decide the next session instead of repeating everything equally.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {steps.map((step) => (
            <article key={step.title} className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/features"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Explore features
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
