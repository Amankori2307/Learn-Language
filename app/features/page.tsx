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
} from "../_components/public-site";

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
    <PublicPageShell>
      <PublicSection className="py-16 md:py-24" width="content">
        <PublicIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Features", href: "/features" },
          ]}
          eyebrow="Product Features"
          title="Language learning features built for retention, not just repetition."
          description="Learn-Lang combines adaptive review, pronunciation support, analytics, and reviewer governance into one product surface for structured vocabulary practice."
        />

        <PublicCardGrid>
          {featureSections.map((section) => (
            <PublicCard key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.body}</p>
            </PublicCard>
          ))}
        </PublicCardGrid>

        <PublicActionRow>
          <PublicActionLink href="/how-it-works" variant="primary">
            See how it works
          </PublicActionLink>
          <PublicActionLink href="/auth">Start learning</PublicActionLink>
        </PublicActionRow>
      </PublicSection>
    </PublicPageShell>
  );
}
