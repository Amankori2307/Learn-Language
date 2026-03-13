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
  { level: "Level 0", requirement: "No correct streak yet. The word has not started building mastery." },
  { level: "Level 1", requirement: "1 correct answer in a row. The word has entered the learning stage." },
  { level: "Level 2", requirement: "3 correct answers in a row. Recall is improving but still in progress." },
  { level: "Level 3", requirement: "5 correct answers in a row. The word is close to graduating." },
  { level: "Level 4", requirement: "7 correct answers in a row. The word counts as mastered." },
] as const;

const wordStates = [
  {
    title: "Learning Words",
    body: "These are words with mastery level 1 to 3. You have started recalling them correctly, but the app still treats them as in progress.",
    action: "Keep answering them correctly in review and new-word sessions until they build enough repeated recall to reach mastered.",
  },
  {
    title: "Mastered Words",
    body: "These are words with mastery level 4 or higher. In practice, that means you have recalled them correctly enough times for the app to trust longer spacing.",
    action: "Do not ignore them. Daily review keeps mastered words fresh so they stay retrievable instead of quietly decaying.",
  },
  {
    title: "Needs Review Words",
    body: "These are words flagged because errors are high or the next review is overdue. They are the words most at risk of being forgotten right now.",
    action: "Run weak-word drills and daily review, then rebuild the word with repeated correct answers so it can move back into learning and later mastered.",
  },
] as const;

const transitions = [
  {
    title: "How a word enters Learning",
    body: "A word starts moving once you answer it correctly. The first correct answer creates a streak and moves it out of the untouched state into active learning.",
  },
  {
    title: "How a word becomes Mastered",
    body: "Mastery is earned through repeated correct recall. In Learn-Lang, mastery level 4 is reached after a seven-answer correct streak for that word.",
  },
  {
    title: "How a word falls into Needs Review",
    body: "A word is flagged when wrong answers pile up or when its scheduled review is overdue. That is the app saying the memory is no longer stable enough to trust.",
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
          title="What Mastered, Learning, and Needs Review actually mean."
          description="Learn how word progress works in Learn-Lang, what each learning state tells you, and what actions help a word move toward stable recall."
          descriptionClassName="max-w-3xl"
        />

        <PublicSurface className="mt-12">
          <h2 className="text-2xl font-semibold">What these terms mean</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Learn-Lang tracks each word separately. The state of a word is not a label for how smart a
            learner is. It is a practical signal about memory strength and what the next action should
            be. The more consistent your recall, the higher the mastery level and the longer the spacing
            between reviews.
          </p>
        </PublicSurface>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Word states</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            These are the learner-facing buckets you see in analytics and review flows.
          </p>
          <PublicCardGrid className="mt-6 md:grid-cols-3">
            {wordStates.map((state) => (
              <PublicCard key={state.title}>
                <h3 className="text-lg font-semibold">{state.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{state.body}</p>
                <p className="mt-4 text-sm font-medium text-foreground">{state.action}</p>
              </PublicCard>
            ))}
          </PublicCardGrid>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Mastery levels</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Mastery is based on consecutive correct answers for the same word. The level is the internal
            signal behind the visible word buckets.
          </p>
          <PublicCardGrid className="mt-6 md:grid-cols-3">
            {masteryLevels.map((level) => (
              <PublicCard key={level.level}>
                <h3 className="text-lg font-semibold">{level.level}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{level.requirement}</p>
              </PublicCard>
            ))}
          </PublicCardGrid>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">How words move between states</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            A word changes state because of recall performance over time, not because you opened the app
            or looked at the card once.
          </p>
          <div className="mt-6 space-y-4">
            {transitions.map((item) => (
              <PublicCard key={item.title}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
              </PublicCard>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">What to do in each state</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The state is useful only if it changes what you do next.
          </p>
          <div className="mt-6 space-y-4">
            <PublicCard>
              <h3 className="text-lg font-semibold">If a word is Learning</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Keep practicing it in daily review and new-word sessions. Your goal is repeated correct
                recall in both directions, not just one lucky answer.
              </p>
            </PublicCard>
            <PublicCard>
              <h3 className="text-lg font-semibold">If a word is Mastered</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Let the spaced schedule do its work, but keep showing up for daily review. Mastered means
                the word earned longer spacing, not permanent immunity from forgetting.
              </p>
            </PublicCard>
            <PublicCard>
              <h3 className="text-lg font-semibold">If a word Needs Review</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Prioritize weak-word drills and daily review. This is the app highlighting the words most
                likely to break first unless you repair them with fresh correct answers.
              </p>
            </PublicCard>
          </div>
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
            that direction. A word is not truly strong until recall is reliable in the directions you
            want to use.
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
