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

const routeSeo = getSeoRouteDefinition("/methodology");

export const metadata: Metadata = routeSeo
  ? {
      title: { absolute: routeSeo.title },
      description: routeSeo.description,
      alternates: { canonical: "/methodology" },
      openGraph: {
        url: `${APP_SITE_URL}/methodology`,
        title: routeSeo.title,
        description: routeSeo.description,
      },
      twitter: {
        title: routeSeo.title,
        description: routeSeo.description,
      },
    }
  : {};

const recognitionVsRecall = [
  {
    title: "Recognition feels easier",
    body: "Multiple-choice and familiar-looking cards can create a false sense of progress because the answer is already present in front of you.",
  },
  {
    title: "Recall exposes what is actually retrievable",
    body: "Producing an answer from memory is harder, but it reveals whether the word is strong enough to use outside the app.",
  },
  {
    title: "Difficulty is useful data",
    body: "When recall is slow or wrong, that is not failure. It is the signal that tells the next review schedule what needs more reinforcement.",
  },
] as const;

const spacedRepetitionPrinciples = [
  {
    title: "Review sooner after weak recall",
    body: "Words that are missed or answered with low certainty should return quickly while the gap is still small enough to repair.",
  },
  {
    title: "Space reviews after strong recall",
    body: "When recall is consistently correct, the interval should widen so practice time goes to weaker material instead of comfortable repeats.",
  },
  {
    title: "Retention matters more than streak theater",
    body: "The goal is not to maximize taps or sessions. The goal is to keep vocabulary retrievable after real time passes.",
  },
] as const;

const appMethodSteps = [
  {
    title: "Prompt without giving away the answer",
    body: "Learn-Lang favors prompts that ask the learner to retrieve meaning or wording, often with pronunciation context, instead of only spotting the right option.",
  },
  {
    title: "Measure answer quality, not just correctness",
    body: "Correctness, confidence, and response speed shape whether a word should stay close in the schedule or move farther out.",
  },
  {
    title: "Use analytics to choose the next drill",
    body: "Word buckets, history, and learning insights exist to show whether the learner should reinforce weak words, practice clusters, or continue normal review.",
  },
] as const;

export default function MethodologyPage() {
  return (
    <PublicPageShell>
      <PublicSection className="py-16 md:py-24" width="content">
        <PublicIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Methodology", href: "/methodology" },
          ]}
          eyebrow="Methodology"
          title="Active recall and spaced repetition are the core learning method."
          description="Learn-Lang is built around one practical idea: memory improves when learners retrieve answers from memory and revisit material at the point it is about to fade, not when they repeatedly recognize familiar cards."
          descriptionClassName="max-w-3xl"
        />

        <PublicSurface className="mt-12">
          <h2 className="text-2xl font-semibold">Why this page exists</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Many language products feel productive because they make review frictionless. That can
            help with exposure, but exposure alone is not enough. Learn-Lang treats retrieval as the
            real test of learning, then uses review timing to revisit words before they disappear.
          </p>
        </PublicSurface>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Recognition versus recall</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Recognition helps learners notice familiar material. Recall is what helps them produce it
            later in conversation, listening, writing, or reading without a hint.
          </p>
          <PublicCardGrid className="mt-6 md:grid-cols-3">
            {recognitionVsRecall.map((item) => (
              <PublicCard key={item.title}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
              </PublicCard>
            ))}
          </PublicCardGrid>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Why spaced repetition matters</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Repeating everything equally wastes time. Strong words need distance. Fragile words need
            quick repair. The schedule should reflect that difference.
          </p>
          <div className="mt-6 space-y-4">
            {spacedRepetitionPrinciples.map((principle) => (
              <PublicCard key={principle.title}>
                <h3 className="text-lg font-semibold">{principle.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{principle.body}</p>
              </PublicCard>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">How Learn-Lang applies the method</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The product design is meant to turn these ideas into day-to-day practice decisions rather
            than leaving the learner to guess what to study next.
          </p>
          <PublicCardGrid className="mt-6 md:grid-cols-3">
            {appMethodSteps.map((step) => (
              <PublicCard key={step.title}>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.body}</p>
              </PublicCard>
            ))}
          </PublicCardGrid>
        </div>

        <PublicSurface className="mt-12">
          <h2 className="text-2xl font-semibold">The practical promise</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Learn-Lang does not promise effortless fluency. It tries to make effort count. If a word
            is easy, the app should stop over-serving it. If a word is weak, the app should bring it
            back with the right kind of prompt before the learner loses it entirely.
          </p>
        </PublicSurface>

        <PublicActionRow>
          <PublicActionLink href="/how-it-works">See the learning loop</PublicActionLink>
          <PublicActionLink href="/auth" variant="primary">
            Start learning
          </PublicActionLink>
        </PublicActionRow>
      </PublicSection>
    </PublicPageShell>
  );
}
