/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import "../client/src/index.css";
import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";

export const metadata: Metadata = {
  metadataBase: new URL("https://learn-lang.amankori.me"),
  title: {
    default: APP_BRAND_NAME,
    template: `%s | ${APP_BRAND_NAME}`,
  },
  description: `${APP_BRAND_NAME} helps you learn languages with spaced repetition, adaptive review, and pronunciation-aware vocabulary practice.`,
  keywords: [
    "language learning",
    "spaced repetition",
    "vocabulary trainer",
    "pronunciation practice",
    "learn languages",
    "learn-lang",
    "flashcards",
  ],
  applicationName: APP_BRAND_NAME,
  alternates: {
    canonical: "/",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "android-chrome", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "android-chrome", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  themeColor: "#0ea5e9",
  openGraph: {
    type: "website",
    url: "/",
    title: APP_BRAND_NAME,
    description:
      "Learn languages with adaptive quizzes, review cycles, and structured vocabulary practice.",
    siteName: APP_BRAND_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_BRAND_NAME,
    description:
      "Adaptive language learning with review loops, pronunciation support, and focused vocabulary practice.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
