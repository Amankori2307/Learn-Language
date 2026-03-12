# SEO And Crawlability Contract

This document records the completed `P10-009` SEO hardening baseline.

It is also the maintenance contract for future sitemap, metadata, and tag-manager updates. Keep this document aligned with the shared SEO ownership module whenever route visibility or crawler policy changes.

## Route classification

Current route classes:

- public/indexable:
  - `/`
  - `/features`
  - `/how-it-works`
  - `/languages/telugu`
  - `/topics`
  - `/auth`
- authenticated/private:
  - `/dashboard`
  - `/quiz`
  - `/clusters`
  - `/leaderboard`
  - `/profile`
  - `/history`
  - `/analytics`
  - `/analytics/words`
  - `/review`
  - `/review/add`
  - `/contextual`
  - `/tutor`
- non-indexable infrastructure:
  - `/api/*`
  - `/robots.txt`
  - `/sitemap.xml`

## Current metadata policy

- root layout provides site-wide metadata, Open Graph, Twitter, icons, manifest, and structured data
- root layout also owns the Google Tag Manager bootstrap and noscript fallback
- route-specific metadata is generated in the app-router entry surfaces, with the public home page owning `/` and the catch-all SPA route owning authenticated paths
- public routes may emit canonical URLs and `index/follow`
- authenticated/private routes now emit `noindex, nofollow`
- unknown routes now emit `noindex, nofollow`
- route metadata, sitemap inclusion, and crawler intent are owned from one shared SEO route-definition registry

Primary files:

- [layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/layout.tsx)
- [page.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/[...slug]/page.tsx)
- [seo.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/domain/constants/seo.ts)

## Current sitemap policy

- sitemap now includes only intentionally public routes
- the current sitemap contains `/`, `/features`, `/how-it-works`, `/languages/telugu`, `/topics`, and `/auth`
- protected learner/reviewer surfaces are intentionally excluded
- sitemap entries are now generated from the same shared route-definition registry that owns route metadata

Primary file:

- [sitemap.ts](/Users/aman/Projects/personal-projects/Learn-Language/app/sitemap.ts)

## Current robots policy

- `/api/*` remains disallowed
- authenticated/private app routes are disallowed
- the crawler is allowed to access `/`, `/features`, `/how-it-works`, `/languages/telugu`, `/topics`, and `/auth`

Primary file:

- [robots.ts](/Users/aman/Projects/personal-projects/Learn-Language/app/robots.ts)

## Structured data policy

- root structured data still describes the website and software application
- the old `SearchAction` was removed because it pointed at a protected route and was misleading for crawlers

## Build-status note

- the previous Next metadata warning for `themeColor` has been resolved by moving it from metadata export to viewport export

## Search Console / crawler submission runbook

1. Verify production host and sitemap:
   - `https://learn-lang.amankori.me/robots.txt`
   - `https://learn-lang.amankori.me/sitemap.xml`
2. Add the site property in Google Search Console for:
   - `https://learn-lang.amankori.me`
3. Submit:
   - `https://learn-lang.amankori.me/sitemap.xml`
4. Request reindexing for:
   - `https://learn-lang.amankori.me/`
   - `https://learn-lang.amankori.me/features`
   - `https://learn-lang.amankori.me/how-it-works`
   - `https://learn-lang.amankori.me/languages/telugu`
   - `https://learn-lang.amankori.me/topics`
   - `https://learn-lang.amankori.me/auth`
5. Repeat the equivalent submission in Bing Webmaster Tools if desired.

## Known limitations

- the application is still primarily an authenticated SPA, so public crawlable surface is limited to the landing, feature, explainer, public language/topic pages, and sign-in entry routes
- if GTM container ownership or analytics policy changes, update the shared SEO constants and this document together
