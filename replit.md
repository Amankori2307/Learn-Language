# Overview

This is a **Telugu Language Learning Quiz App** — an adaptive, quiz-based platform for learning Telugu vocabulary. Users learn words grouped into semantic clusters, practice through quizzes with multiple question types (Telugu-to-English, English-to-Telugu, audio), and progress via an adaptive spaced repetition algorithm. The app tracks mastery levels, streaks, XP, and provides a dashboard with learning statistics.

The core learning flow is: **Words → Clusters → Sentences → Quiz → Adaptive Repetition → Mastery**

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, with custom hooks wrapping API calls
- **Styling**: Tailwind CSS with shadcn/ui component library (new-york style), CSS variables for theming
- **Animations**: Framer Motion for quiz transitions, canvas-confetti for celebration effects
- **Fonts**: Outfit (headings), Noto Sans Telugu (Telugu script), loaded via Google Fonts
- **Build Tool**: Vite with React plugin
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express.js running on Node with TypeScript (via tsx)
- **Architecture**: Monolithic server serving both the API and the static frontend
- **API Pattern**: RESTful JSON API under `/api/` prefix with typed route contracts defined in `shared/routes.ts` using Zod schemas
- **Authentication**: Google OAuth (OpenID Connect) with Passport.js, sessions stored in PostgreSQL via `connect-pg-simple`
- **Auth files are in**: `server/auth/` — these are critical and should not be deleted
- **Dev Mode**: Vite dev server middleware with HMR is integrated into Express during development
- **Production**: Client is built with Vite to `dist/public`, server is bundled with esbuild to `dist/index.cjs`

### Shared Layer (`shared/`)
- **Schema** (`shared/schema.ts`): Drizzle ORM table definitions for all models — words, clusters, word_clusters, user_word_progress, quiz_attempts, users, sessions
- **Route Contracts** (`shared/routes.ts`): Typed API contract using Zod schemas, shared between client and server for type safety
- **Auth Models** (`shared/models/auth.ts`): User and session table definitions required by OAuth login

### Database
- **Database**: PostgreSQL (required, provisioned via Replit)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Push**: `npm run db:push` uses drizzle-kit to push schema changes
- **Migrations Directory**: `./migrations`
- **Connection**: `DATABASE_URL` environment variable required

### Key Database Tables
- `words` — Telugu vocabulary with transliteration, English meaning, part of speech, difficulty, example sentences
- `clusters` — Semantic/grammar/functional word groupings
- `word_clusters` — Many-to-many join between words and clusters
- `user_word_progress` — Per-user spaced repetition tracking (mastery level, next review date, confidence)
- `quiz_attempts` — Log of individual quiz answers
- `users` — User profiles (managed by OAuth login)
- `sessions` — Session storage for auth

### Storage Pattern
- `server/storage.ts` defines an `IStorage` interface and `DatabaseStorage` class implementing all data operations
- Includes a `seedInitialData()` method for populating initial Telugu vocabulary and clusters
- Run seeding via `seed.ts` at project root

### API Routes (defined in `server/routes.ts`)
- `GET /api/words` — List words with optional filters
- `GET /api/words/:id` — Get single word
- `GET /api/clusters` — List all clusters
- `GET /api/clusters/:id` — Get cluster with associated words
- `GET /api/quiz/generate` — Generate quiz questions (modes: daily_review, new_words, cluster, weak_words)
- `POST /api/quiz/submit` — Submit quiz answer and get feedback
- `GET /api/stats` — Get user learning statistics
- `GET /api/auth/user` — Get current authenticated user
- All API routes require authentication via `isAuthenticated` middleware

### Client Pages
- `/auth` — Login page using OAuth login
- `/` — Dashboard with stats, streak, XP, and quick-start quiz cards
- `/quiz` — Quiz interface with animated question cards, progress bar, session summary
- `/clusters` — Browse word clusters and start cluster-specific quizzes

## External Dependencies

- **PostgreSQL** — Primary database, connected via `DATABASE_URL` env var
- **Google OAuth (OpenID Connect)** — Authentication provider, requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` env vars
- **Google Fonts** — Outfit and Noto Sans Telugu fonts loaded via CDN
- **shadcn/ui + Radix UI** — Component library primitives
- **Drizzle ORM + drizzle-kit** — Database ORM and migration tooling
- **TanStack React Query** — Async state management
- **Framer Motion** — Animation library
- **canvas-confetti** — Visual celebration effects
- **Passport.js** — Authentication middleware framework
- **connect-pg-simple** — PostgreSQL session store for Express
