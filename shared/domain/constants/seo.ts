import { APP_BRAND_NAME } from "./app-brand";

export const APP_SITE_URL = "https://learn-lang.amankori.me";

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

export const APP_PUBLIC_ROUTES = ["/auth"] as const;

export const APP_PROTECTED_ROUTES = [
  "/",
  "/quiz",
  "/clusters",
  "/leaderboard",
  "/profile",
  "/history",
  "/analytics",
  "/analytics/words",
  "/review",
  "/review/add",
  "/contextual",
  "/tutor",
] as const;

export const SEO_ROUTE_METADATA: Record<
  string,
  {
    title: string;
    description: string;
    index: boolean;
  }
> = {
  "/auth": {
    title: `Sign In | ${APP_BRAND_NAME}`,
    description:
      "Sign in to Learn-Lang to access adaptive vocabulary practice, spaced repetition review, and pronunciation-aware study sessions.",
    index: true,
  },
  "/": {
    title: APP_BRAND_NAME,
    description: APP_DEFAULT_DESCRIPTION,
    index: false,
  },
  "/quiz": {
    title: `Quiz | ${APP_BRAND_NAME}`,
    description: "Adaptive quiz practice for signed-in learners.",
    index: false,
  },
  "/clusters": {
    title: `Clusters | ${APP_BRAND_NAME}`,
    description: "Signed-in cluster exploration and vocabulary grouping.",
    index: false,
  },
  "/leaderboard": {
    title: `Leaderboard | ${APP_BRAND_NAME}`,
    description: "Signed-in leaderboard and progress comparison.",
    index: false,
  },
  "/profile": {
    title: `Profile | ${APP_BRAND_NAME}`,
    description: "Signed-in learner profile and preferences.",
    index: false,
  },
  "/history": {
    title: `History | ${APP_BRAND_NAME}`,
    description: "Signed-in review and attempt history.",
    index: false,
  },
  "/analytics": {
    title: `Analytics | ${APP_BRAND_NAME}`,
    description: "Signed-in learning analytics and insights.",
    index: false,
  },
  "/analytics/words": {
    title: `Word Buckets | ${APP_BRAND_NAME}`,
    description: "Signed-in word-bucket analytics and review guidance.",
    index: false,
  },
  "/review": {
    title: `Review | ${APP_BRAND_NAME}`,
    description: "Reviewer-only queue and moderation workflows.",
    index: false,
  },
  "/review/add": {
    title: `Add Vocabulary | ${APP_BRAND_NAME}`,
    description: "Reviewer-only vocabulary draft submission.",
    index: false,
  },
  "/contextual": {
    title: `Contextual Practice | ${APP_BRAND_NAME}`,
    description: "Signed-in contextual learning flows.",
    index: false,
  },
  "/tutor": {
    title: `Tutor | ${APP_BRAND_NAME}`,
    description: "Signed-in tutoring and guided practice.",
    index: false,
  },
};
