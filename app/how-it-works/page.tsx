/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import {
  PublicActionLink,
  PublicActionRow,
  PublicCard,
  PublicIntro,
  PublicPageShell,
  PublicSection,
} from "../_components/public-site";

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
    <PublicPageShell>
      <PublicSection className="py-16 md:py-24" width="content">
        <PublicIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "How It Works", href: "/how-it-works" },
          ]}
          eyebrow="How It Works"
          title="A learning loop designed around recall quality and review timing."
          description="Learn-Lang uses an adaptive loop: study what matters now, review what is drifting, and use analytics to decide the next session instead of repeating everything equally."
          descriptionClassName="max-w-3xl"
        />
        <div className="mt-12 space-y-4">
          {steps.map((step) => (
            <PublicCard key={step.title}>
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.body}</p>
            </PublicCard>
          ))}
        </div>

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
