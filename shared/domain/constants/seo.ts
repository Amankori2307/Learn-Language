import { APP_BRAND_NAME } from "./app-brand";

export const APP_SITE_URL = "https://learn-lang.amankori.me";
export const APP_GOOGLE_TAG_MANAGER_ID = "GTM-NTPX5G8P";

export const APP_DEFAULT_DESCRIPTION = `${APP_BRAND_NAME} helps you learn languages with spaced repetition, adaptive review, and pronunciation-aware vocabulary practice.`;

export const APP_KEYWORDS = [
  "language learning",
  "spaced repetition",
  "vocabulary trainer",
  "pronunciation practice",
  "learn languages",
  "learn-lang",
  "flashcards",
];

export type SeoChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface ISeoRouteDefinition {
  path: string;
  title: string;
  description: string;
  index: boolean;
  changeFrequency?: SeoChangeFrequency;
  priority?: number;
}

export const SEO_ROUTE_DEFINITIONS: readonly ISeoRouteDefinition[] = [
  {
    path: "/",
    title: `${APP_BRAND_NAME} | Adaptive Language Learning`,
    description:
      "Learn-Lang is a structured language-learning app for adaptive vocabulary review, listening practice, and reviewer-governed study content.",
    index: true,
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/features",
    title: `Language Learning Features | ${APP_BRAND_NAME}`,
    description:
      "Explore Learn-Lang features including spaced repetition, listening prompts, analytics, cluster practice, and reviewer-governed vocabulary workflows.",
    index: true,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/how-it-works",
    title: `How Learn-Lang Works | ${APP_BRAND_NAME}`,
    description:
      "See how Learn-Lang combines adaptive review, pronunciation-aware study, and reviewer-governed content to improve language retention.",
    index: true,
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/mastery",
    title: `Mastery Guide | ${APP_BRAND_NAME}`,
    description:
      "Learn what Mastered, Learning, and Needs Review mean in Learn-Lang, how a word reaches mastery, and what action to take for each state.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.78,
  },
  {
    path: "/methodology",
    title: `Active Recall And Spaced Repetition | ${APP_BRAND_NAME}`,
    description:
      "Understand the Learn-Lang methodology: why active recall beats passive recognition and how spaced repetition improves long-term vocabulary retention.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/languages/telugu",
    title: `Learn Telugu Vocabulary | ${APP_BRAND_NAME}`,
    description:
      "Explore public Telugu vocabulary examples, high-frequency topic clusters, and the Learn-Lang study approach for Telugu learners.",
    index: true,
    changeFrequency: "weekly",
    priority: 0.88,
  },
  {
    path: "/topics",
    title: `Vocabulary Topics | ${APP_BRAND_NAME}`,
    description:
      "Browse public high-frequency vocabulary topics such as greetings, daily use, verbs, nouns, and time-based language practice.",
    index: true,
    changeFrequency: "weekly",
    priority: 0.82,
  },
  {
    path: "/auth",
    title: `Sign In | ${APP_BRAND_NAME}`,
    description:
      "Sign in to Learn-Lang to access adaptive vocabulary practice, spaced repetition review, and pronunciation-aware study sessions.",
    index: true,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/dashboard",
    title: `Dashboard | ${APP_BRAND_NAME}`,
    description: APP_DEFAULT_DESCRIPTION,
    index: false,
  },
  {
    path: "/quiz",
    title: `Quiz | ${APP_BRAND_NAME}`,
    description: "Adaptive quiz practice, listening prompts, and recall feedback for signed-in learners.",
    index: false,
  },
  {
    path: "/clusters",
    title: `Clusters | ${APP_BRAND_NAME}`,
    description: "Browse vocabulary clusters and jump into focused signed-in practice sets.",
    index: false,
  },
  {
    path: "/leaderboard",
    title: `Leaderboard | ${APP_BRAND_NAME}`,
    description: "Track streaks, rank movement, and learner progress comparisons.",
    index: false,
  },
  {
    path: "/profile",
    title: `Profile | ${APP_BRAND_NAME}`,
    description: "Manage learner preferences, confidence settings, and account details.",
    index: false,
  },
  {
    path: "/history",
    title: `History | ${APP_BRAND_NAME}`,
    description: "Review recent attempts, outcomes, and learning momentum over time.",
    index: false,
  },
  {
    path: "/analytics",
    title: `Analytics | ${APP_BRAND_NAME}`,
    description: "Inspect learning insights, progress trends, and spaced-repetition performance.",
    index: false,
  },
  {
    path: "/analytics/words",
    title: `Word Buckets | ${APP_BRAND_NAME}`,
    description: "See which words are weak, improving, or mastered and choose the right next drill.",
    index: false,
  },
  {
    path: "/review",
    title: `Review | ${APP_BRAND_NAME}`,
    description: "Reviewer queue for moderation, approval, and conflict-resolution workflows.",
    index: false,
  },
  {
    path: "/review/add",
    title: `Add Vocabulary | ${APP_BRAND_NAME}`,
    description: "Submit new vocabulary drafts with structured content for reviewer approval.",
    index: false,
  },
  {
    path: "/contextual",
    title: `Contextual Practice | ${APP_BRAND_NAME}`,
    description: "Study vocabulary in sentence-driven context and reinforce usage patterns.",
    index: false,
  },
  {
    path: "/tutor",
    title: `Tutor | ${APP_BRAND_NAME}`,
    description: "Open guided tutoring and practice support for signed-in learners.",
    index: false,
  },
] as const;

export const APP_PUBLIC_ROUTES = SEO_ROUTE_DEFINITIONS.filter((route) => route.index).map((route) => route.path);

export const APP_PROTECTED_ROUTES = SEO_ROUTE_DEFINITIONS.filter((route) => !route.index).map((route) => route.path);

export function normalizeSeoPath(input?: string | null) {
  const raw = (input ?? "").trim();
  const withoutQuery = raw.split(/[?#]/)[0];

  if (!withoutQuery || withoutQuery === "/") {
    return "/";
  }

  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : withLeadingSlash;
}

export function getSeoRouteDefinition(path: string) {
  const normalizedPath = normalizeSeoPath(path);
  const exactMatch = SEO_ROUTE_DEFINITIONS.find((route) => route.path === normalizedPath);
  if (exactMatch) {
    return exactMatch;
  }

  const prefixMatch = SEO_ROUTE_DEFINITIONS.filter(
    (route) => route.path !== "/" && normalizedPath.startsWith(`${route.path}/`),
  ).sort((a, b) => b.path.length - a.path.length)[0];

  return prefixMatch;
}
