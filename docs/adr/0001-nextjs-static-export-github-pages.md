# ADR-0001: Next.js static export, single page, hosted on GitHub Pages

**Status:** Proposed
**Date:** 2026-09-26
**Deciders:** Sandeep Pamujula

## Context

The typing tutor is a backend-free website: a learner enters a name, types for two minutes, and gets a
score and a personal best stored in the browser. The original requirements asked for vanilla
HTML/CSS/JS opened directly from `index.html` with no build step. We want TypeScript, component-level
tests and a clear separation between pure logic and UI, which a build step makes practical.

Forces:
- No backend, no network calls after load, no third-party origins (fonts, CDNs).
- Must work offline once loaded, from 360 px wide, keyboard-only, light and dark mode.
- Logic (scoring, timer, passage, typing engine) must be unit-testable without a browser.
- The repository lives at `github.com/SandeepPamujula/sdd-type-writer`, so GitHub Pages serves it under `/sdd-type-writer/`.

## Decision

1. **Framework:** Next.js App Router with `output: 'export'`, React and TypeScript (`strict`). Every
   component that touches the browser is a client component; there are no API routes, server actions
   or middleware.
2. **Delivery:** static files deployed to **GitHub Pages** by a GitHub Actions workflow on every push to
   `main`. `basePath` (and asset prefix) come from an environment variable (`NEXT_PUBLIC_BASE_PATH`,
   `/sdd-type-writer` on Pages, empty locally). Locally the build is checked with `npx serve out`.
   Opening `index.html` from `file://` is **not** supported.
3. **Single page:** one route (`/`). Name entry, typing and results are states of one screen state
   machine in `app/page.tsx`, not separate routes. The browser Back button leaves the site.
4. **Code layout:**
   - `src/lib/`: pure TypeScript with no React or DOM imports: `passage`, `typingEngine`, `timer`,
     `scoring`, `names`, `storage` (a localStorage adapter where every access is wrapped in try/catch).
     The clock and random-number source are injected so tests can control them.
   - `src/components/`: React UI.
   - `app/`: layout and the page state machine.
5. **Styling:** CSS Modules plus global CSS custom-property tokens; dark mode through
   `prefers-color-scheme` only (no toggle). System font stacks only; the passage uses the system
   monospace stack. No `next/font/google` or other web fonts.

## Options Considered

### Option A: Next.js static export on GitHub Pages (chosen)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium: `basePath` and a Pages workflow |
| Cost | Free hosting |
| Scalability | Static CDN; not a concern |
| Team familiarity | High (React/TS) |

**Pros:** TypeScript and React Testing Library out of the box; static output; free hosting with deploy on merge.
**Cons:** Needs a build and a static server; cannot be opened from `file://`; a large framework for one page.

### Option B: Vanilla HTML/CSS/JS, no build (original requirement)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Low to build, higher to test |
| Cost | Free |
| Scalability | Not a concern |
| Team familiarity | Medium |

**Pros:** Double-click `index.html` works; zero dependencies.
**Cons:** No types; component tests need a hand-rolled harness; logic and DOM tend to mix in one IIFE.

### Option C: Vite + React with a single-file build
**Pros:** Lighter than Next.js; a single-file plugin can make `file://` work.
**Cons:** Not the stack chosen for the project; the single-file build is an extra, less common setup.

## Trade-off Analysis

The "open from disk" requirement is the only thing Option A loses. It was replaced by "deployable to any
static host, including under a sub-path, and offline after load", which matters more to learners and is
testable. In exchange we get types, a standard test setup and a clear place for pure logic.

## Consequences

- Easier: unit-testing logic in `src/lib`, component tests, a live deployment from the first change.
- Harder: every asset URL must respect `basePath`; a Pages-specific workflow must be maintained.
- Revisit: if offline use *before* first load is ever needed, add a service worker (currently out of scope).

## Action Items
1. [ ] Change `bootstrap-web-platform`: scaffold Next.js with `output: 'export'`, `basePath` from env, CSS tokens, system fonts.
2. [ ] Change `bootstrap-web-platform`: add the GitHub Pages deploy workflow and enable Pages (source: GitHub Actions).
3. [ ] Change `bootstrap-web-platform`: Playwright smoke test that loads the built site under `/sdd-type-writer/` and fails on any third-party request.
