# ADR-0003: Tooling, tests and CI gates

**Status:** Proposed
**Date:** 2026-09-26
**Deciders:** Sandeep Pamujula

## Context

The project is spec-driven: OpenSpec specs in `openspec/specs/` are the source of truth and every change
is implemented test-first. CI must stop code that breaks the tests, the build or the specs from reaching
`main`, and must deploy `main` to GitHub Pages (ADR-0001).

## Decision

**Runtime and packages**
- Node **24 LTS**, pinned in `.nvmrc` and `package.json` `engines`.
- **npm** with a committed `package-lock.json`.
- Next.js and React at the latest stable versions when scaffolded, pinned to exact versions.

**Code quality**
- ESLint with the Next.js config, plus Prettier for formatting (`eslint-config-prettier` to avoid conflicts).
- TypeScript `strict`; `tsc --noEmit` as a separate check.

**Tests**
- **Jest** + **@testing-library/react** (jsdom) for unit and component tests. Test names quote the
  OpenSpec scenario titles they verify.
- **Playwright** for end-to-end tests against the built static site. CI runs Chromium on every PR;
  Firefox and WebKit are added in the `harden-accessibility-and-offline` change.
- Coverage: **≥ 90 % line coverage for `src/lib/`**, enforced by Jest; no threshold for UI code.

**CI (GitHub Actions)**
- On every pull request: `npm ci` → lint → `tsc --noEmit` → Jest with coverage → `next build` →
  Playwright → `openspec validate --all --strict`.
- On push to `main`: the same checks, then deploy `out/` to GitHub Pages.
- **Branch protection on `main`:** changes arrive only through PRs, and all checks above are required.

**Scripts:** `dev`, `build`, `lint`, `typecheck`, `test`, `test:coverage`, `e2e`, `spec:validate`.

## Options Considered

### Option A: Jest + Testing Library + Playwright (chosen)
**Pros:** Widely known, mature ecosystem and tooling, same `expect` style; Playwright covers all three
browser engines.
**Cons:** Slower TypeScript transform than Vitest; needs a `ts-jest` or `babel-jest` config for Next.js
path aliases and JSX.

### Option B: Vitest + Testing Library + Cypress
**Pros:** Fast, TypeScript-native, ESM-first.
**Cons:** Less team familiarity; Cypress WebKit support is experimental.

## Trade-off Analysis

The chosen stack gives familiar, well-documented unit tooling for the TDD loop and real cross-browser e2e
for the input and timer behaviour that jsdom cannot reproduce. Jest's slower TypeScript transform is an
acceptable trade for its maturity and the team's existing familiarity with it. Adding `openspec validate`
to CI keeps the specs and the code from drifting apart silently.

## Consequences

- Easier: confident refactoring; specs cannot be broken silently; a deployed build after every merge.
- Harder: CI takes longer (Playwright, plus Jest's slower TypeScript transform than Vitest); OpenSpec CLI
  must be installed in CI (`npx @fission-ai/openspec`).
- Revisit: add Firefox and WebKit to PR runs if cross-browser bugs appear before the hardening change.

## Action Items
1. [ ] Change `bootstrap-web-platform`: `.nvmrc`, `engines`, ESLint, Prettier, Jest (with coverage threshold), Playwright, npm scripts.
2. [ ] Change `bootstrap-web-platform`: GitHub Actions workflows for PR checks and the Pages deploy.
3. [ ] After Change 1 merges: enable branch protection on `main` with the required checks.
4. [ ] Change `harden-accessibility-and-offline`: add Firefox and WebKit to Playwright.
