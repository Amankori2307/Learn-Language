/* eslint-disable react-refresh/only-export-components */
import Link from "next/link";
import type { Metadata } from "next";
import { APP_BRAND_NAME, APP_BRAND_TAGLINE } from "@shared/domain/constants/app-brand";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import {
  PublicActionLink,
  PublicActionRow,
  PublicCard,
  PublicCardGrid,
  PublicPageShell,
  PublicSection,
  PublicSurface,
} from "./_components/public-site";

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

const featureHighlights = [
  {
    title: "Spaced Repetition That Sticks",
    description: "Daily review, weak-word drills, and adaptive session recommendations keep practice focused on what you are most likely to forget next.",
  },
  {
    title: "Pronunciation-Aware Practice",
    description: "Study with transliteration, listening prompts, and audio-backed vocabulary flows instead of text-only flashcards.",
  },
  {
    title: "Reviewer-Governed Content",
    description: "Vocabulary and examples flow through moderation so the learning surface stays consistent and high-signal.",
  },
] as const;

const audiencePoints = [
  "Practice new words, review overdue items, and recover weak vocabulary from one learner flow.",
  "Track streaks, analytics, word buckets, and cluster-level progress inside the signed-in dashboard.",
  "Support review workflows and structured vocabulary submission for curator and reviewer roles.",
] as const;

const productPromises = [
  {
    title: "Know what to study next",
    description:
      "Daily review, weak-word drills, and cluster-based practice keep the next session focused instead of overwhelming.",
  },
  {
    title: "Practice with pronunciation context",
    description:
      "Transliteration, listening prompts, and audio-aware flows help learners connect recognition with spoken recall.",
  },
  {
    title: "See progress clearly",
    description:
      "Use streaks, analytics, and word buckets to understand what is improving and what still needs repetition.",
  },
] as const;

const publicExplorationLinks = [
  {
    href: "/features",
    title: "Explore language-learning features",
    description: "See the core learner, analytics, audio, and review capabilities in one public overview.",
  },
  {
    href: "/how-it-works",
    title: "Read how the learning loop works",
    description: "Understand the review system, pronunciation-aware study flow, and retention strategy.",
  },
  {
    href: "/languages/telugu",
    title: "Open the Telugu learning page",
    description: "Browse public Telugu examples, topic clusters, and language-specific study context.",
  },
  {
    href: "/topics",
    title: "Browse public vocabulary topics",
    description: "See high-frequency study areas like greetings, daily-use language, verbs, nouns, and time.",
  },
] as const;

export default function HomePage() {
  return (
    <PublicPageShell>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.16),transparent_42%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.45))]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:px-8 md:py-24 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-border/70 bg-background/75 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
              {APP_BRAND_TAGLINE}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                Learn vocabulary with structured repetition, listening, and review-first quality control.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {APP_BRAND_NAME} is a language-learning workspace for focused recall practice,
                pronunciation-aware study, and reviewer-governed vocabulary building.
              </p>
            </div>
            <PublicActionRow>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Start Learning
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background/80 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Open Dashboard
              </Link>
            </PublicActionRow>
          </div>

          <div className="grid w-full max-w-xl gap-4">
            {featureHighlights.map((feature) => (
              <PublicCard
                key={feature.title}
                className="rounded-2xl bg-card/90 p-5 backdrop-blur"
              >
                <h2 className="text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </PublicCard>
            ))}
          </div>
        </div>
      </section>

      <PublicSection className="grid gap-6 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <PublicSurface>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Built For Learners
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Language practice that keeps momentum high and friction low.
          </h2>
          <div className="mt-5 space-y-4">
            {productPromises.map((item) => (
              <PublicCard key={item.title} className="rounded-2xl border-border/50 bg-background/80 p-4 shadow-none">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </PublicCard>
            ))}
          </div>
        </PublicSurface>

        <PublicSurface className="bg-muted/40 shadow-none">
          <h2 className="text-xl font-semibold">What learners can do inside the app</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Learn-Lang is designed for focused vocabulary practice rather than passive browsing.
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
            {audiencePoints.map((point) => (
              <li key={point} className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3">
                {point}
              </li>
            ))}
          </ul>
          <PublicActionRow>
            <PublicActionLink href="/auth" variant="primary">
              Create your study routine
            </PublicActionLink>
            <PublicActionLink href="/features">Explore the product</PublicActionLink>
          </PublicActionRow>
        </PublicSurface>
      </PublicSection>

      <section className="border-t border-border/60 bg-card/40">
        <PublicSection className="py-14 md:py-18">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Explore Public Pages
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Learn how the product works before you sign in.
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              These public pages explain the learning approach, highlight the core features, and
              expose example topic coverage without requiring an account first.
            </p>
          </div>
          <PublicCardGrid className="mt-8">
            {publicExplorationLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-border/60 bg-background p-6 shadow-sm transition-colors hover:bg-muted/60"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </PublicCardGrid>
        </PublicSection>
      </section>
    </PublicPageShell>
  );
}
