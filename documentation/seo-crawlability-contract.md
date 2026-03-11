# SEO And Crawlability Contract

This document records the completed `P10-009` SEO hardening baseline.

## Route classification

Current route classes:

- public/indexable:
  - `/auth`
- authenticated/private:
  - `/`
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
- route-specific metadata is generated in the catch-all app route
- public routes may emit canonical URLs and `index/follow`
- authenticated/private routes now emit `noindex, nofollow`
- unknown routes now emit `noindex, nofollow`

Primary files:

- [layout.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/layout.tsx)
- [page.tsx](/Users/aman/Projects/personal-projects/Learn-Language/app/[[...slug]]/page.tsx)
- [seo.ts](/Users/aman/Projects/personal-projects/Learn-Language/shared/domain/constants/seo.ts)

## Current sitemap policy

- sitemap now includes only intentionally public routes
- the current sitemap contains `/auth` only
- protected learner/reviewer surfaces are intentionally excluded

Primary file:

- [sitemap.ts](/Users/aman/Projects/personal-projects/Learn-Language/app/sitemap.ts)

## Current robots policy

- `/api/*` remains disallowed
- authenticated/private app routes are disallowed
- the crawler is allowed to access `/auth`

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
   - `https://learn-lang.amankori.me/auth`
5. Repeat the equivalent submission in Bing Webmaster Tools if desired.

## Known limitations

- the application currently has very little public crawlable surface because it is primarily an authenticated SPA
- if a future public marketing/home page is added, sitemap, robots, and route metadata should expand to include it explicitly
