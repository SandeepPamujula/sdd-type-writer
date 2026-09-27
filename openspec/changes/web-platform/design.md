# Design

## Context

Greenfield repository: no app code exists yet (only ADRs, the requirements backlog, and this change's
proposal/specs). This design turns [ADR-0001](../../../docs/adr/0001-nextjs-static-export-github-pages.md)
and [ADR-0003](../../../docs/adr/0003-tooling-and-ci.md) into the concrete scaffold, config, and CI
pipeline needed to satisfy the four requirements in `specs/web-platform/spec.md`. See `proposal.md` -
Why for motivation.

Unlike later changes, this one adds no `src/lib` business logic (no passage, typingEngine, timer, scoring,
names, or storage modules) — those arrive with `add-typing-engine`, `add-user-identity`, and
`add-scoring-metrics`. This change's surface is project scaffold, build/deploy config, CSS tokens, and CI.

## Goals / Non-Goals

**Goals:**
- A `next build` (`output: 'export'`) that produces a working `out/` folder servable under a sub-path.
- A GitHub Actions pipeline that gates PRs (lint, typecheck, test, build, e2e, `openspec validate`) and
  deploys `out/` to GitHub Pages only from `main`.
- A CSS token layer that switches light/dark via `prefers-color-scheme`, with no manual toggle and no
  third-party fonts.
- A base layout that holds width from 360 px with no horizontal scroll, verified by Playwright.
- A build-time/e2e guarantee that no request leaves the origin after first load.

**Non-Goals:**
- Any `src/lib` module, name entry, typing session, or scoring UI — placeholders only (empty
  `src/components/`, a minimal `app/page.tsx`).
- Firefox/WebKit in PR e2e runs (deferred to `harden-accessibility-and-offline` per ADR-0003).
- Keyboard-only operation, accessible labelling, and screen-reader behaviour requirements (deferred; see
  proposal.md - Non-goals).

## Decisions

**Scaffold and config** — follow ADR-0001 directly: Next.js App Router, `output: 'export'`, TypeScript
`strict`, single route `/`. `next.config.ts` reads `NEXT_PUBLIC_BASE_PATH` for both `basePath` and
`assetPrefix`, empty locally and `/sdd-type-writer` in the Pages workflow, so the same build works at
either location without a code change. It also reads `NEXT_EXPORT_DIR` to override `distDir` (Next.js
treats a non-default `distDir` as the static-export output folder when `output: 'export'` is set). This
exists solely so the "Served under a sub-path" e2e test can export its `basePath`-prefixed build into an
isolated directory instead of overwriting the shared `out/` folder the main webServer is concurrently
serving — the two `next build` processes racing over the same directory caused real, hard-to-diagnose
hangs (Windows file locks) during development.

**CSS tokens over a CSS-in-JS or Tailwind approach** — CSS Modules plus a single `:root` custom-property
sheet (`src/styles/tokens.css`), redefined under `@media (prefers-color-scheme: dark)`. Chosen because
ADR-0001 fixes this and it needs zero runtime JS and no third-party origin, satisfying "No backend" and
"Light and dark themes" together. Alternative considered: a JS theme provider — rejected, it would add a
runtime dependency and a flash-of-wrong-theme risk that a pure CSS media query avoids.

**Placeholder page over deferring `app/page.tsx`** — `app/page.tsx` renders a minimal placeholder (not the
name-entry screen; that's `add-user-identity`), so the responsive-layout and theme requirements have a real
page to test against instead of an empty shell. Alternative considered: leave `app/page.tsx` at the
Next.js default — rejected, it would not exercise the token system or prove the layout holds at 360 px.

**CI as the enforcement mechanism for "No backend"** — rather than a runtime check, a Playwright e2e test
asserts zero network requests fire after the initial document load (via the page's `request` event),
and a build-time grep/lint rule blocks `next/font/google` or any hard-coded external origin in source.
Chosen because these requirements are only meaningfully verifiable at build/e2e time, not at runtime in
production (there is nothing to "check" once deployed — the guarantee has to hold before merge).

**Test seams (per requirement):**
| Requirement | Verified by |
|---|---|
| No backend | Playwright e2e: `expect(networkRequestsAfterLoad).toHaveLength(0)`; lint rule forbidding external URLs / `next/font/google` |
| Static delivery | Playwright e2e run against `npx serve out` with `basePath` set, both with and without a sub-path prefix |
| Responsive layout | Playwright e2e at 360 px and 375 px viewports: `expect(page).not.toHaveHorizontalScroll()` (custom assertion) |
| Light and dark themes | Playwright e2e with `colorScheme: 'dark'` / `'light'` emulation, snapshotting computed token values |

No `src/lib` public functions are introduced by this change, so there are no unit-test seams beyond the
e2e checks above; `src/lib`'s own ≥90% coverage gate (ADR-0003) starts applying from `add-typing-engine`
onward.

## Risks / Trade-offs

- [Risk] `basePath` misconfiguration silently breaks asset loading only under Pages, not locally →
  Mitigation: the sub-path Playwright run in CI serves the build with the Pages `basePath` set, catching
  it before merge.
- [Risk] A future change adds a font or script from a CDN without noticing the "No backend" constraint →
  Mitigation: the lint rule and e2e network-request check in this change's CI apply to every subsequent
  PR, not just this one.
- [Risk] Next.js code-splitting could lazy-load a chunk after first load, technically violating "no
  network requests after load" the first time a not-yet-fetched route segment renders → Mitigation: the
  single-route design means there is only one page; the e2e check exercises the full initial render, and
  this is revisited if `harden-accessibility-and-offline` needs it (see Open Questions in
  `docs/architecture/c4.md`).

## Migration Plan

No migration — this is the first code in the repository. Rollback is `git revert` of the scaffold commit;
there is no deployed state to unwind since GitHub Pages only deploys from `main` after CI passes.
