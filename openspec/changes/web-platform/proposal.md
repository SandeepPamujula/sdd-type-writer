# Proposal

## Why

No application code exists yet. Every later capability (name entry, the typing session, scoring) needs a
working, deployable static site to build on top of, so this change bootstraps that foundation first.

## What Changes

- Scaffold a Next.js App Router project (`output: 'export'`, single route `/`) in TypeScript strict mode,
  per ADR-0001.
- Add the GitHub Pages deployment path: `basePath` read from an environment variable, static `out/` build,
  and a GitHub Actions workflow that deploys only on `main` (ADR-0003).
- Add CI checks that gate merges: lint, typecheck, unit tests, `next build`, e2e, and
  `openspec validate --all --strict` (ADR-0003).
- Add the CSS token system: CSS Modules plus CSS custom-property tokens, system fonts only, following
  `prefers-color-scheme` for light/dark themes with no manual toggle.
- Add a base responsive layout usable at viewport widths from 360 px with no horizontal scrolling.
- Guarantee no network requests after initial load and no third-party/CDN origins (fonts, scripts, or
  otherwise) anywhere in the build output.
- Add the empty `src/lib` and `src/components` structure (no logic yet) so later changes have a
  consistent place to add code.

## Capabilities

### New Capabilities
- `web-platform`: static delivery (no backend, deployable to any static host including under a sub-path),
  a responsive base layout down to 360 px, and light/dark theming driven by the OS preference. This change
  captures only these four requirements from the full `web-platform` capability; the rest are deferred
  (see Non-goals).

### Modified Capabilities
_None — no other capability specs exist yet._

## Impact

- New: `package.json`, `next.config.*`, `tsconfig.json`, ESLint/Prettier config, `app/layout.tsx`,
  `app/page.tsx` (placeholder), `src/styles` tokens, `.github/workflows/ci.yml` (and deploy job),
  empty `src/lib/`, `src/components/` directories.
- No existing code is modified (greenfield).
- No backend, database, or third-party service is introduced.

## Requirements captured from the backlog

From `docs/requirements-backlog.md`, capability `web-platform`:
- No backend
- Static delivery
- Responsive layout
- Light and dark themes

## Non-goals

Deliberately left for later changes:
- `web-platform`: Keyboard-only operation, Accessible labelling, Screen reader behaviour during a session,
  Browser support — captured by `add-typing-screen` and `harden-accessibility-and-offline` once there is
  UI to make accessible.
- `user-identity`, `typing-session`, `scoring` capabilities in full — captured by
  `add-user-identity`, `add-typing-engine`, `add-typing-screen`, `add-scoring-metrics`, and
  `add-results-and-personal-best`. This change adds no product features, only the platform shell.
