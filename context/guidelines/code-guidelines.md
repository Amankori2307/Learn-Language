# Code Guidelines (Enforced Baseline)

## Goals

- Keep code modular and cohesive by domain.
- Centralize string constants with enums.
- Standardize interface naming for API/domain contracts.
- Keep logic separate from UI rendering so visual layer swaps are low-risk.
- Eliminate magic numbers via named constants/enums.
- Keep delivery flow disciplined so phase work lands on isolated branches and production automation stays tied to `main`.

## Rules

1. Modularity:

- Keep domain constants/types in `shared/domain/*`.
- Keep route contracts in `shared/routes.ts`.
- Keep DB models in `shared/schema.ts`.
- Keep auth logic under `server/auth/*`.

2. Enum-first constants:

- Do not repeat magic strings for roles, statuses, directions, modes, or question types.
- Use shared enums from `shared/domain/enums.ts`.
- In Zod contracts, prefer `z.nativeEnum(...)`.

3. Interface naming:

- For reusable domain/API shapes, use `I` prefix:
  - Example: `IUser`, `IQuizAttemptHistoryItem`.
- Keep table infer types where needed, but expose interface aliases for app-level usage.

4. Type boundaries:

- Shared types/enums must be imported by both client and server where applicable.
- Avoid creating duplicate union literals in feature files.
- Do not define reusable interfaces/enums/constants inside controller/service/repository files.
- Place them in domain-owned modules (shared domain or feature `types/constants` files).
- Shared enums belong in `shared/domain/enums.ts` unless they are strictly database-only.
- Database-only enums belong in `server/src/infrastructure/database.enums.ts`.
- Cross-layer reusable shapes belong in `shared/*`; do not restate them as parallel exported aliases in feature files without a real semantic reason.
- Module-level reusable server types belong in `*.types.ts` or `*.repository.types.ts`, not in controller/service/repository implementations.
- Feature-local client types may stay in hook/service/lib files only while they remain local to that feature; once reused across domains, promote them into `shared/*`.

5. UI/logic separation:

- Keep business logic, data shaping, and side effects in hooks/services/view-model helpers.
- Keep presentational components focused on rendering and event wiring.
- UI libraries/components should be replaceable without rewriting business logic.
- New UI components must be theme-aware by default and consume shared semantic tokens for color, border, surface, radius, shadow, and motion.
- Do not hardcode one-off palette classes, raw hex values, or light/dark-only assumptions in new reusable components when an existing theme token or shared variant can express the same intent.
- Shared and feature UI components should render correctly across all currently implemented themes, not just the theme active during development.
- If a component introduces a new reusable visual state or variant, add it through the shared token/variant system so future themes inherit it automatically.
- Pages and presentational components must not define transport-backed `useQuery`/`useMutation` calls or call `apiClient` directly.
- Shared React Query lifecycle belongs in `client/src/hooks/*`; page-specific orchestration belongs in feature `use-*-view-model.ts` modules.
- The module that defines a shared query should also define its query-key builder and own its invalidation expectations.
- Query keys should use stable positional tuples with resource key first, scope variables next, and pagination/filter variables last.
- Use narrow invalidation by default; broad invalidation is allowed only for clearly global/admin mutations and should be documented inline.
- Feature-specific stale-time/retry overrides should come from one shared rule seam rather than repeated ad hoc literals.

6. No magic numbers:

- Do not hardcode unexplained numeric literals in business logic.
- Use named constants/enums for thresholds, limits, scoring weights, retries, timeouts, and page sizes.
- Local numeric literals are acceptable only when self-evident and domain-neutral (e.g., array index `0`/`1` in trivial loops).
- If introducing a new behavior-shaping number, either name it immediately or document why it is intentionally local and obvious.

7. Backward-compatible migration approach:

- Introduce enum/type wrappers first.
- Replace scattered string literals incrementally by phase.
- Keep CI green after each module migration.

8. Lint policy (zero warnings):

- `pnpm run lint` must pass with `--max-warnings=0`.
- Do not merge code with ESLint warnings.
- Treat `react-refresh/only-export-components` and `@typescript-eslint/no-unused-vars` as errors.
- `pnpm run lint` also enforces symbol ownership through `script/check-symbol-governance.ts`.
- Exported enums outside approved enum modules and duplicate exported reusable symbol names are CI failures.

9. Shared contract governance:

- Shared domain enums belong in `shared/domain/enums.ts`.
- Database-only enums belong in `server/src/infrastructure/database.enums.ts`.
- New exported enums should not be introduced anywhere else without first promoting them into one of those modules.
- Cross-layer API and domain shapes belong in `shared/*`.
- Module-level reusable server shapes belong in `*.types.ts` or `*.repository.types.ts` files, not in controllers, services, or repositories.
- Reusable client types belong in feature-owned hook/service/lib modules only when they are not shared across domains.
- Avoid public alias wrappers that simply restate an existing enum or interface name in another module unless the alias carries genuinely different semantics.

10. Documentation hygiene:

- Keep implementation-backed documentation in the `documentation/` folder up to date when behavior, architecture, operations, or testing scope changes.
- If a code change makes an existing document inaccurate, update that document in the same change instead of leaving stale guidance behind.
- Prefer updating the canonical existing document over creating duplicate notes for the same topic.
- When a planning file contains durable information that is still useful after implementation, move that information into `documentation/` and archive the planning file instead of deleting it.
- Keep a hard boundary between canonical docs and planning material:
  - `documentation/` is for current product, architecture, and operations docs only
  - workflow and repository-governance rules belong in `context/guidelines/`
  - active or future work belongs in `context/active-tasks/` or `context/future-tasks/`
  - completed planning history and superseded notes belong in `context/archive/`
- `pnpm run lint` enforces the documentation boundary through `script/check-documentation-boundary.ts`; do not bypass it by placing planning-oriented markdown under `documentation/`.
- `pnpm run lint` also enforces context workflow boundaries through `script/check-context-workflow.ts`; do not leave active phase files untracked in the backlog or turn future backlog files into an execution board.
- When public routing, crawlability, analytics tags, sitemap contents, metadata policy, robots rules, or canonical behavior changes, update the canonical SEO/runtime docs and the shared SEO ownership module in the same change.

11. Branch workflow:

- Start each new phase on a new git branch.
- Use one branch per phase; do not stack multiple active phases on the same long-lived branch.
- Recommended naming: `phase-<number>-<short-scope>` or equivalent team-approved phase naming.
- Keep `main` as the integration and deployment branch.
- Merge a phase branch into `main` only after its scoped work is verified and ready for integration.
- CI/CD should be treated as `main`-driven only; do not assume non-`main` branches deploy automatically.
- If a phase is large, use short-lived sub-branches off the phase branch only when necessary, then merge them back into the phase branch before merging to `main`.
- Before starting the next phase, branch from the latest `main` unless there is an explicit reason to branch from another approved integration branch.

12. Commit hygiene:

- Commit once you have a sizable, coherent set of changes.
- Commit when you complete a major logical task, not only at the very end of a long phase.
- Prefer commits that represent one meaningful unit of progress and can be understood or reverted independently.
- Do not mix unrelated fixes, refactors, and feature work into the same commit unless they are inseparable for correctness.

13. Dependency injection:

- Prefer plain constructor injection for concrete Nest class providers.
- Use `@Inject(...)` only when the runtime token cannot be inferred safely from the parameter type.
- Typical valid cases: custom tokens, interfaces, `useFactory`, `useValue`, or multiple provider implementations behind one abstraction.
- Avoid `@Inject(ClassName)` by default when plain constructor injection is equivalent.
- Prefer constructor injection by class for normal module-local controllers, services, and repositories.
- Reserve explicit tokens for true abstractions and infrastructure seams.
- If a provider begins as a concrete class and later needs multiple implementations, introduce a named token at that time instead of pre-optimizing every constructor now.
- Keep provider ownership obvious: modules wire providers, constructors declare dependencies, and tokens appear only where runtime indirection is real.

14. AI feature bar:

- Do not add AI features without an explicit product problem, rollout gate, privacy check, and deterministic fallback where needed.
- Never put non-deterministic AI behavior directly into grading, reviewer approval, or other correctness-critical paths.
- Prefer reviewer-assist and recommendation use cases over autonomous learner-scoring flows.

15. Responsive implementation bar:

- Treat mobile-first as a layering strategy, not permission to degrade tablet/laptop/desktop UX.
- When changing a surface for phone layouts, explicitly preserve or improve the corresponding desktop layout.
- Do not remove desktop structure, hierarchy, spacing, or affordances just to simplify the mobile version.
- Responsive refactors must be reviewed in at least one phone width and one desktop width before they are considered complete.
- Do not use legacy `vh` for layout sizing. Prefer `dvh` for dynamic viewport sizing when browser UI changes should reflow layout, `svh` for the smallest stable viewport when UI chrome should never overlap content, and `lvh` for the largest stable viewport when full-bleed growth is acceptable.

16. Theme-safe component bar:

- New shared primitives and feature components must prefer semantic classes such as `bg-background`, `text-foreground`, `border-border`, `bg-card`, and shared status tokens over raw Tailwind palette classes.
- New components must not assume only `light` and `dark`; they should work under the implemented named themes and avoid `dark:` branches unless there is no token-based alternative yet.
- Theme-sensitive values such as overlay treatment, border radius, shadows, and transition feel should come from existing CSS variables or shared variants instead of local one-off styling.
- If a new component cannot be made theme-safe immediately, document the limitation in the task and treat it as explicit follow-up debt instead of leaving the assumption implicit.

17. SEO ownership:

- Route titles, descriptions, canonical/index rules, sitemap inclusion, and shared marketing/runtime tags must be owned from the centralized SEO constants/module rather than scattered across pages.
- When adding, renaming, opening, or closing a route, update that centralized SEO ownership file so sitemap and metadata stay in sync.
- Public/indexable routes must have explicit title, description, canonical behavior, sitemap policy, and crawler intent; protected routes must explicitly declare `noindex` behavior instead of relying on omission.
- Keep `shared/domain/constants/seo.ts`, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, route-level metadata generation, and `documentation/operations/seo-crawlability.md` aligned with the centralized SEO ownership file.
- When SEO behavior changes, also review the related public SEO surfaces and assets, including structured data, canonical links, Open Graph/Twitter metadata, manifest/icon references, favicon/app-icon assets under `public/`, and any public marketing-entry routes that affect crawlability.
- Treat SEO upkeep as part of the route-definition done criteria: a route change is not complete until metadata, sitemap eligibility, robots intent, analytics tags, and documentation have been reviewed and updated where needed.

18. Design system governance:

- The app must have one canonical design-system contract documented in `documentation/architecture/`, and shared UI work must follow it instead of inventing local page rules.
- New or changed UI must use shared semantic tokens for color, typography, spacing, radius, border, elevation, motion, and interactive states wherever a shared token or variant already exists.
- Reusable components must not hardcode one-off widths, spacing scales, arbitrary radii, shadows, or palette values when the same outcome can be expressed through the design-system contract.
- When a new reusable visual pattern appears in more than one surface, promote it into a shared primitive, shared composite, or shared variant instead of copying styling into feature files.
- Feature-local styling exceptions are allowed only when the need is truly feature-specific and the limitation is documented as explicit follow-up debt or a tracked approved exception.
- Shared components must define consistent size, variant, and state behavior. Do not let the same semantic action or status use different visual hierarchy across routes without an approved design-system reason.
- Page composition should prefer approved shell, section, stack, cluster, pane, and content-width patterns over ad hoc layout wrappers.

19. Responsive design-system rules:

- Treat phone and desktop as first-class targets for every meaningful UI change. Tablet and laptop behavior should be an intentional transition between those two states, not an accidental byproduct.
- Mobile layouts must preserve primary actions, content hierarchy, and readable spacing without relying on hover, tiny hit targets, or sideways scrolling for core tasks.
- Desktop layouts must preserve scanability, density, alignment, and multi-column structure where that improves comprehension; do not collapse rich desktop surfaces to oversized single-column layouts unless the surface genuinely benefits from it.
- Minimum touch-target and control sizing should follow the shared component-size contract; mobile compaction must never make controls harder to activate than the shared standard allows.
- Dense data surfaces must define an intentional degradation strategy for smaller widths, such as stacked cards, wrapped action rows, sectional disclosure, sticky summary bars, or contained horizontal scrolling only when the information type truly requires it.
- Forms must define label, helper, validation, and action placement rules for both mobile and desktop. Desktop forms should use available width intentionally; mobile forms should avoid side-by-side compression that harms readability.
- Overlays must have viewport-specific behavior. If a dialog pattern is not workable on phone, use the approved sheet or drawer pattern instead of shrinking the desktop dialog indefinitely.
- Responsive success, empty, loading, and error states must follow the same container and spacing rules as the success layout for that route.

20. Design-system enforcement:

- `pnpm run lint` is expected to enforce design-system governance alongside existing quality gates. When the repo adds or extends checks, raw palette classes, forbidden arbitrary values, and unauthorized shared-style duplication should be treated as CI failures, not optional warnings.
- If a shared token, shared variant, or layout primitive exists, bypassing it requires a documented exception. Exceptions must have an owner, a reason, and a follow-up path; they must not remain as silent permanent drift.
- UI pull requests should verify affected surfaces at at least one phone width and one desktop width before merge. A responsive change is incomplete if only one viewport class was checked.
- Reviews should reject reusable UI additions that introduce raw hex values, raw Tailwind palette classes, ad hoc breakpoint behavior, or duplicated state styling without first extending the design system.
- Design-system changes that alter durable component behavior, layout rules, or responsive contracts must update the canonical architecture documentation in the same change.

## Adoption plan

- Phase 4D:
  - D1: publish guidelines + shared enums baseline.
  - D2: migrate auth + quiz/review contract constants to enums.
  - D3: gradual repo-wide cleanup of remaining literals.
