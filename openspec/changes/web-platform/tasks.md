# Tasks

## 1. Project scaffold and tooling

- [x] 1.1 Initialize the Next.js App Router project (TypeScript strict, `output: 'export'`) with the
      dependency versions and file layout from ADR-0001 and ADR-0003; verify `npm install` succeeds and
      `npm run typecheck` passes on the empty scaffold
- [x] 1.2 Add `.nvmrc` (Node 24) and `engines` in `package.json`; add ESLint (Next.js config) + Prettier
      with `eslint-config-prettier`; verify `npm run lint` passes on the scaffold
- [x] 1.3 Add Jest + `@testing-library/react` (jsdom) with a coverage config (≥90% threshold scoped to
      `src/lib/`) and Playwright with a Chromium project; add the `dev`, `build`, `lint`, `typecheck`,
      `test`, `test:coverage`, `e2e`, `spec:validate` npm scripts; verify `npm run test` and
      `npm run e2e` both run (zero tests is an acceptable pass at this point) with no config errors

## 2. Static export, sub-path delivery, and the no-backend guarantee

*Requirements: No backend, Static delivery*

- [x] 2.1 Configure `next.config.ts` to read `NEXT_PUBLIC_BASE_PATH` for `basePath`/`assetPrefix` (empty
      by default); verify `next build` produces a working `out/` folder locally with an empty base path
- [x] 2.2 Add an ESLint rule (or custom lint script) forbidding `next/font/google` imports and hard-coded
      third-party URLs in `src/`/`app/`; verify it fails on a deliberately introduced violation, then
      remove the violation
- [x] 2.3 Write the Playwright e2e test for requirement "No backend" (scenarios "Offline after load" and
      "No data leaves the browser": zero network requests fire after the initial document load when
      served from `npx serve out`); verify it passes against the scaffold from 2.1
- [x] 2.4 Write the Playwright e2e tests for requirement "Static delivery" (scenarios "Served from a
      static host" and "Served under a sub-path": run `npx serve out` twice, once with `basePath` empty
      and once set to `/sdd-type-writer`); verify both runs load the page and its assets correctly

## 3. CSS token system and theming

*Requirement: Light and dark themes*

- [x] 3.1 Add `app/layout.tsx` (HTML shell, system font stack only) and `src/styles/tokens.css` with
      `:root` custom properties for background, text, and the correct/incorrect/pending feedback colors;
      verify a component test renders the layout and reads the computed token values
- [x] 3.2 Add dark-mode token overrides under `@media (prefers-color-scheme: dark)`; verify the Playwright
      e2e test for scenario "Dark mode" (emulating `colorScheme: 'dark'`) shows dark backgrounds and
      legible token values, and the same test with `colorScheme: 'light'` shows the light values
- [x] 3.3 Give the "incorrect" token a non-color marker (background highlight or underline, not color
      alone); verify scenario "Incorrect without relying on colour" with a test harness element styled
      with the token, asserting both a color and a non-color (background/text-decoration) property differ
      from the "pending" token

## 4. Responsive base layout

*Requirement: Responsive layout*

- [x] 4.1 Add a minimal placeholder `app/page.tsx` inside a responsive container (fluid width, no fixed
      pixel widths below 360 px) using the tokens from Section 3; verify the Playwright e2e test for
      scenario "Phone width" at a 375 px viewport shows no horizontal scrollbar
- [x] 4.2 Add the viewport meta tag and a CSS base/reset preventing overflow; verify the same e2e check
      also passes at exactly 360 px

## 5. CI pipeline and deploy workflow

- [x] 5.1 Add a GitHub Actions PR workflow: `npm ci` → lint → `tsc --noEmit` → Jest with coverage →
      `next build` → Playwright (Chromium) → `openspec validate --all --strict`; verify the workflow
      passes on this change's own branch/PR
- [x] 5.2 Add a deploy job that builds with `NEXT_PUBLIC_BASE_PATH=/sdd-type-writer` and publishes `out/`
      to GitHub Pages, gated to run only on push to `main`; verify the job's build step succeeds locally
      with that env var set (`next build` produces the sub-path-prefixed output) and the workflow YAML
      validates (e.g. `actionlint`)

## 6. Backlog cleanup

- [x] 6.1 Remove the four captured requirements (No backend, Static delivery, Responsive layout, Light
      and dark themes) and the `bootstrap-web-platform` row of the Change plan table from
      `docs/requirements-backlog.md`; verify the file still lists the remaining `web-platform`
      requirements (Keyboard-only operation, Accessible labelling, Screen reader behaviour during a
      session, Browser support) and the other three capabilities untouched
