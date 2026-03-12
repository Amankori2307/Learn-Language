/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { APP_SITE_URL, getSeoRouteDefinition } from "@shared/domain/constants/seo";
import { getTopPublicTopics } from "@shared/domain/public-seo-content";
import {
  PublicActionLink,
  PublicActionRow,
  PublicCard,
  PublicIntro,
  PublicPageShell,
  PublicSection,
} from "../_components/public-site";

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
    <PublicPageShell>
      <PublicSection className="py-16 md:py-24" width="content">
        <PublicIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Topics", href: "/topics" },
          ]}
          eyebrow="Public Topics"
          title="Vocabulary topics learners practice most often."
          description="These public topic summaries expose the study areas already represented in the app’s seed content, from greetings and daily-use language to verbs, nouns, and time phrases."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {topics.map((topic) => (
            <PublicCard key={topic.slug}>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold capitalize">{topic.slug.replaceAll("-", " ")}</h2>
                <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                  {topic.wordCount} words
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{topic.description}</p>
            </PublicCard>
          ))}
        </div>

        <PublicActionRow>
          <PublicActionLink href="/languages/telugu">Explore Telugu</PublicActionLink>
          <PublicActionLink href="/auth" variant="primary">
            Start learning
          </PublicActionLink>
        </PublicActionRow>
      </PublicSection>
    </PublicPageShell>
  );
}
