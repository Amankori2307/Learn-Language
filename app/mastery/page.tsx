/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import {
  PublicActionLink,
  PublicActionRow,
  PublicCard,
  PublicCardGrid,
  PublicIntro,
  PublicPageShell,
  PublicSection,
  PublicSurface,
} from "../_components/public-site";

const routeSeo = getSeoRouteDefinition("/mastery");

export const metadata: Metadata = routeSeo
  ? {
      title: { absolute: routeSeo.title },
      description: routeSeo.description,
      alternates: { canonical: "/mastery" },
      openGraph: {
        url: `${APP_SITE_URL}/mastery`,
        title: routeSeo.title,
        description: routeSeo.description,
      },
      twitter: {
        title: routeSeo.title,
        description: routeSeo.description,
      },
    }
  : {};

const masteryLevels = [
  { level: "Level 0", requirement: "No correct streak yet." },
  { level: "Level 1", requirement: "1 correct answer in a row." },
  { level: "Level 2", requirement: "3 correct answers in a row." },
  { level: "Level 3", requirement: "5 correct answers in a row." },
  { level: "Level 4", requirement: "7 correct answers in a row." },
] as const;

const qualitySignals = [
  {
    title: "Correctness",
    body: "Only correct answers advance the streak. Incorrect answers reset the streak and shorten the next interval.",
  },
  {
    title: "Confidence",
    body: "Higher confidence boosts answer quality. Low confidence lowers quality and slows future spacing.",
  },
  {
    title: "Response time",
    body: "Fast responses slightly improve quality, while very slow answers reduce it.",
  },
] as const;

const schedulingRules = [
  {
    title: "Early reviews stay close",
    body: "The first correct answer keeps the next review soon to reinforce recall quickly.",
  },
  {
    title: "Intervals expand with consistency",
    body: "After the second correct answer, spacing grows based on your ease factor and recent quality.",
  },
  {
    title: "Mistakes reset timing",
    body: "Incorrect answers reset the streak and return the word to the shortest interval.",
  },
] as const;

export default function MasteryPage() {
  return (
    <PublicPageShell>
      <PublicSection className="py-16 md:py-24" width="content">
        <PublicIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Mastery", href: "/mastery" },
          ]}
          eyebrow="Mastery Guide"
          title="Mastery is earned through consistent recall, not luck."
          description="Learn how mastery works in Learn-Lang, what counts as progress, and why your review schedule changes as you improve."
          descriptionClassName="max-w-3xl"
        />

        <PublicSurface className="mt-12">
          <h2 className="text-2xl font-semibold">What mastery means</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Mastery is a per-word progress state for each learner. It is driven by a correct streak and
            used to schedule when you see that word again. The more consistent your recall, the higher
            the mastery level and the longer the spacing between reviews.
          </p>
        </PublicSurface>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Mastery levels</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Mastery is based on consecutive correct answers for the same word.
          </p>
          <PublicCardGrid className="mt-6 md:grid-cols-3">
            {masteryLevels.map((level) => (
              <PublicCard key={level.level}>
                <h3 className="text-lg font-semibold">{level.level}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{level.requirement}</p>
              </PublicCard>
            ))}
          </PublicCardGrid>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">What affects scheduling</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The review interval grows from a combination of streak length and answer quality.
          </p>
          <div className="mt-6 space-y-4">
            {schedulingRules.map((rule) => (
              <PublicCard key={rule.title}>
                <h3 className="text-lg font-semibold">{rule.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{rule.body}</p>
              </PublicCard>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Answer quality signals</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Learn-Lang measures answer quality to adjust spacing gently without changing the mastery
            thresholds.
          </p>
          <PublicCardGrid className="mt-6 md:grid-cols-3">
            {qualitySignals.map((signal) => (
              <PublicCard key={signal.title}>
                <h3 className="text-lg font-semibold">{signal.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{signal.body}</p>
              </PublicCard>
            ))}
          </PublicCardGrid>
        </div>

        <PublicSurface className="mt-12">
          <h2 className="text-2xl font-semibold">Direction-specific strength</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Learn-Lang tracks strength in both directions: source language to English, and English to
            source language. Each direction improves independently based on the answers you give in
            that direction.
          </p>
        </PublicSurface>

        <PublicActionRow>
          <PublicActionLink href="/features">Explore features</PublicActionLink>
          <PublicActionLink href="/auth" variant="primary">
            Start learning
          </PublicActionLink>
        </PublicActionRow>
      </PublicSection>
    </PublicPageShell>
  );
}
