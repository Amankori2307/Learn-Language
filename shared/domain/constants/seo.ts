import { APP_BRAND_NAME } from "./app-brand";

export const APP_SITE_URL = "https://learn-lang.amankori.me";

export const APP_DEFAULT_DESCRIPTION =
  `${APP_BRAND_NAME} helps you learn languages with spaced repetition, adaptive review, and pronunciation-aware vocabulary practice.`;

export const APP_KEYWORDS = [
  "language learning",
  "spaced repetition",
  "vocabulary trainer",
  "pronunciation practice",
  "learn languages",
  "learn-lang",
  "flashcards",
];

export const APP_PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/clusters",
  "/analytics",
  "/leaderboard",
  "/review",
  "/review/add",
  "/profile",
] as const;

