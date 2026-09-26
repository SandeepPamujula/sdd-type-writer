# Tasks

## 1. Project scaffolding

- [x] 1.1 Create the Next.js app (App Router, TypeScript strict, Tailwind, `src/` dir, `output: "standalone"`) with npm and verify `npm run build` and `npm run dev` succeed
- [x] 1.2 Configure ESLint, Prettier, and `npm run lint` / `npm run typecheck` / `npm run format:check` scripts and verify all three pass on the scaffold
- [x] 1.3 Set up Vitest + React Testing Library (jsdom) with a sample test and verify `npm test` passes
- [ ] 1.4 Set up Playwright for Chromium, Firefox, and WebKit with a smoke test that loads `/` and verify `npx playwright test` passes
- [ ] 1.5 Create the module layout from design.md (`src/lib/{typing-engine,identity,drills,passages}`, `src/server`, `prisma/`, `deploy/helm/`, `infra/terraform/`) and add an import-boundary lint rule so `src/lib/typing-engine` cannot import React, Next.js, or Node I/O; verify the rule fails on a deliberate bad import
- [ ] 1.6 Add `docker-compose.yml` with PostgreSQL for local development and `.env.example`, and verify `docker compose up -d` gives a reachable database

## 2. Typing engine (pure TypeScript)

- [ ] 2.1 Implement the engine state machine (`idle → running ⇄ paused → completed`) with `char`, `backspace`, `pause`, `resume`, `reset` events and per-position states (pending, correct, incorrect, current); verify with Vitest tests for case-sensitive comparison, cursor advancing on errors, and completion on the last position
- [ ] 2.2 Implement backspace rules (restore pending, no-op at start, timer not started by backspace) and verify with Vitest tests including the "Teh" → "The" correction scenario
- [ ] 2.3 Implement active-time tracking (timer starts on first char, paused time excluded, resume key not entered) and verify with Vitest tests using injected timestamps for the 30 s + 2 min tab-switch scenario
- [ ] 2.4 Implement the event log (append-only, timestamps in active ms) and `replay(passage, log)` that rebuilds the final state; verify replay reproduces live state for recorded sequences
- [ ] 2.5 Implement session measurements (elapsed time, typed characters, total/correct keystrokes, uncorrected/total errors) and verify with the typing-metrics "cat" scenario and error-count scenarios
- [ ] 2.6 Implement Gross WPM, Net WPM (floored at 0), and accuracy per project definitions with display rounding helpers; verify with Vitest tests for 250 chars / 5 errors / 60 s → 50 and 45, the Net-WPM-floor case, and 247/260 → 95.0%
- [ ] 2.7 Implement per-key stats (attributed to expected key, letters case-insensitive) and verify with Vitest tests for the "expected e, typed r" scenario
- [ ] 2.8 Implement log validation and plausibility checks (timestamps never decrease, replay reaches completion, events ≤ 4 × passage length, elapsed ≥ 1 s, Gross WPM ≤ 300) and verify with Vitest tests for zero-duration, 450 WPM, truncated, and out-of-order logs
- [ ] 2.9 Add property-based tests (fast-check) that random keystroke sequences never produce NaN/Infinity, negative WPM, or accuracy outside 0–100, and verify they pass

## 3. Shared domain libraries

- [ ] 3.1 Implement name normalization and validation in `src/lib/identity` (NFC, trim, collapse whitespace, 2–30 chars, allowed character set, `nameKey`) and verify with Vitest tests for the "  Ada   Lovelace " case, empty, whitespace-only, 30/31 characters, `<script>`, emoji, and non-Latin letters
- [ ] 3.2 Write the initial passage library `passages.json` (at least 30 original passages, stable ids) and the picker that never repeats the previous passage; verify with a Vitest test that every passage is 100–400 characters, US-QWERTY typeable, single-spaced, with no line breaks, and that the picker avoids the last id
- [ ] 3.3 Add the bundled word list (~5,000 common English words) and implement the seeded weak-key drill generator including punctuation/digit attachment; verify with Vitest tests that output is 100–400 characters, every word contains a weak key, and the same seed gives the same output

## 4. Practice UI (client)

- [ ] 4.1 Build the engine external store and `useSyncExternalStore` hooks with per-index subscriptions; verify with an RTL test that a keystroke re-renders only the affected `<Char>` components (render counter)
- [ ] 4.2 Build `PassageView` with memoized `<Char>` components and `data-state` styling (color plus underline/strike, visible cursor, reduced-motion safe); verify with RTL tests for each state's attributes and a contrast check of the Tailwind tokens against WCAG 2.1 AA
- [ ] 4.3 Build the hidden-textarea input capture (`beforeinput` for characters, `keydown` for Backspace/Escape, IME composition ignored, autocorrect attributes off) and verify with RTL tests for typing, backspace, Escape restart, and modifier keys being ignored
- [ ] 4.4 Block paste and drop with the "Pasting is disabled during practice" notice and verify with an RTL test that no characters are entered and no keystrokes counted
- [ ] 4.5 Implement pause on `blur`/`visibilitychange` with the "Press any key to resume" overlay and screen-reader announcements; verify with RTL tests and a Playwright test that switches tabs and checks elapsed time is unchanged
- [ ] 4.6 Build `LiveStats` (elapsed time and live Net WPM on a 250 ms interval, independent of keystrokes) and verify with an RTL test using fake timers
- [ ] 4.7 Build `ResultsPanel` (Net/Gross WPM, accuracy, uncorrected/total errors, time, "too short to score" state, Next passage / Try again actions, completion announced to screen readers) and verify with RTL tests for normal and invalid sessions
- [ ] 4.8 Build `TouchGate` using `(any-pointer: fine)` with the "Typing practice needs a physical keyboard" message and a progress link; verify with a Playwright test using a touch-only mobile device profile
- [ ] 4.9 Assemble `/practice` from the components above using a local passage (no persistence yet), including discard-on-navigation; verify with a Playwright keyboard-only test that types a full passage and reaches results
- [ ] 4.10 Add the Playwright keystroke performance test (400-character passage, CPU throttling, p95 input-to-paint < 16 ms via the Performance API) and verify it passes; if it fails, switch `PassageView` to the direct-DOM fallback from design D2

## 5. Persistence and server actions

- [ ] 5.1 Implement `src/server/env.ts` (Zod-validated environment) loaded from `instrumentation.ts`, logging only missing key names and exiting 1; verify with a Vitest test and by starting the app without `DATABASE_URL`
- [ ] 5.2 Add the `pino` logger with redaction of `DATABASE_URL`, passwords, and connection strings, plus Prisma error categorization; verify with a Vitest test that a logged connection error contains no secret values
- [ ] 5.3 Write `prisma/schema.prisma` (User, Session, SessionKeyStat with the unique constraints and indexes from design.md), generate the initial migration, and verify `prisma migrate deploy` applies cleanly to an empty local database
- [ ] 5.4 Add a Prisma client singleton and a Vitest integration-test harness that runs against a disposable Postgres (Testcontainers or the compose DB); verify a sample repository test passes
- [ ] 5.5 Implement the user repository (upsert by `nameKey`, keeping the original `displayName`) and verify with integration tests for "Ada Lovelace" vs "ada lovelace" and new-user creation
- [ ] 5.6 Implement the `enterName` Server Action (Zod + shared validation, sets `tw_uid` cookie as HttpOnly/SameSite=Lax/Secure/1 year) and verify with tests that invalid names are rejected server-side with nothing stored
- [ ] 5.7 Build `/` with `NameForm` (inline errors announced, focus kept on the input, Enter submits, works without JS via the Server Action), redirecting remembered users and offering "Not you? Change name"; verify with Playwright tests for first visit, return visit, cleared cookie, and name switch
- [ ] 5.8 Implement the session repository (insert with `ON CONFLICT (userId, clientSessionId) DO NOTHING`, key stats in the same transaction, personal best query) and verify with integration tests that duplicate saves store one row
- [ ] 5.9 Implement the `saveSession` Server Action (64 KB body limit, Zod schema, server-side replay and plausibility checks, metrics recalculated from the log, returns personal-best flag) and verify with integration tests for the tampered-metrics, malformed-request, and implausible-session scenarios
- [ ] 5.10 Wire `ResultsPanel` to `saveSession` with save status, "New personal best!", and retry that keeps the log in memory; verify with a Playwright test that fails the first save (route interception) and succeeds on retry without retyping
- [ ] 5.11 Load the passage and personal best in the `/practice` Server Component from the remembered user (redirect to `/` if none) and verify with a Playwright test that a completed session appears in the database for that user

## 6. Progress page

- [ ] 6.1 Implement the history query (newest first, 20 per page) and the `/progress` history list with pagination and the "No sessions yet" empty state; verify with integration tests for 25 sessions and a Playwright test for the empty state
- [ ] 6.2 Implement the trends query (last 30 sessions) and the last-10 vs previous-10 summary including "Complete 20 sessions to see your trend"; verify with Vitest tests for the "Up 5 WPM" and fewer-than-20 scenarios
- [ ] 6.3 Build the server-rendered SVG trend chart with the `<details>` table alternative; verify with an RTL/axe test that the table exposes the same data and the page has no accessibility violations
- [ ] 6.4 Implement the weakest-keys aggregate query (last 20 sessions, ≥ 10 attempts, ordered by error rate then errors, limit 5) and the progress-page panel with the "Keep practicing…" state; verify with integration tests covering ties and the minimum-attempts rule
- [ ] 6.5 Build `/practice/drill` using the drill generator and the user's weakest keys, saved with `isDrill = true` and labeled in history, hiding the option when there are no weak keys; verify with a Playwright test that seeds key stats and completes a drill
- [ ] 6.6 Verify data scoping with a Playwright test in which "Grace" and "Alan" each save sessions and each sees only their own history, trends, and weakest keys

## 7. Operational endpoints and runtime behavior

- [ ] 7.1 Implement `GET /api/health` (always 200 `{"status":"ok"}`) and verify with a Vitest route test, including one with the database stopped
- [ ] 7.2 Implement `GET /api/health/ready` (database ping with a 2 s timeout, 503 when unreachable or shutting down, no error details) and verify with integration tests against a running and a stopped database
- [ ] 7.3 Implement the SIGTERM handler (sets `shuttingDown`, readiness returns 503) and check whether the Next.js standalone server drains in-flight requests; add the custom `server.js` wrapper (25 s drain) if it does not, and verify with a script that sends SIGTERM during a slow request and confirms it completes
- [ ] 7.4 Document local development (docker compose, env vars, migrations, test commands) in `README.md` and verify a fresh clone reaches a running app by following it

## 8. Container image and Helm chart

- [ ] 8.1 Write the multi-stage Dockerfile (Node LTS alpine, standalone output, Prisma CLI and migrations included, non-root uid 1000, port 3000) and `.dockerignore`; verify the image builds, runs with `readOnlyRootFilesystem`-equivalent flags plus a tmpfs for `.next/cache`, and serves `/api/health`
- [ ] 8.2 Scan the image (Trivy) and verify there are no critical vulnerabilities and no secrets or `.env` files in the layers
- [ ] 8.3 Create the Helm chart Deployment and Service (env vars, resources, securityContext, emptyDir mounts, `preStop` sleep, `terminationGracePeriodSeconds: 35`, startup/liveness/readiness probes, `maxUnavailable: 0`) and verify with `helm lint` and `helm template` snapshot tests
- [ ] 8.4 Add Ingress (ALB annotations: target-type ip, ACM cert, HTTPS redirect, `/api/health/ready` health check, 20 s deregistration delay), HPA (2–6, 70% CPU), and PodDisruptionBudget; verify with `helm template` output checks
- [ ] 8.5 Add the `ExternalSecret` for `DATABASE_URL` and the `pre-install,pre-upgrade` migration hook Job; verify with `helm template` and a kind/minikube install against a local Postgres that the Job runs before the pods start
- [ ] 8.6 Add `values-staging.yaml` / `values-prod.yaml` and document the chart's values in `deploy/helm/type-writer/README.md`; verify `helm template` succeeds for both environments

## 9. Terraform infrastructure

- [ ] 9.1 Set up the Terraform layout (per-environment roots `staging`/`prod`, remote S3 state with locking, shared modules) and verify `terraform init` and `terraform validate` pass for both
- [ ] 9.2 Add VPC (public/private subnets across 2+ AZs) and the EKS cluster with a managed node group; verify with `terraform plan` and `tflint`
- [ ] 9.3 Add RDS PostgreSQL (private subnets, security group allowing only EKS nodes, backups and PITR, Multi-AZ in prod) and the Secrets Manager secret for `DATABASE_URL`; verify with `terraform plan` and a Checkov scan with no high findings
- [ ] 9.4 Add the ECR repository (scan on push, immutable tags, lifecycle policy) and IAM roles for the AWS Load Balancer Controller, External Secrets Operator, and GitHub OIDC CI; verify with `terraform plan`
- [ ] 9.5 Document cluster add-on installation (AWS Load Balancer Controller, External Secrets Operator, metrics-server) and the apply order in `infra/terraform/README.md`; verify by applying staging and confirming the add-ons are healthy

## 10. CI/CD pipeline

- [ ] 10.1 Add the PR workflow (lint, typecheck, Vitest unit + integration with a Postgres service, `prisma validate`, Playwright on the built app, `helm lint`, `terraform validate`) and verify it passes on a test PR
- [ ] 10.2 Add the main-branch workflow (OIDC to AWS, build and push the image tagged with the git SHA, Trivy scan, `helm upgrade --install --atomic` to staging, smoke-test `/api/health/ready`) and verify a merge deploys to staging
- [ ] 10.3 Add prod promotion through a GitHub Environment with required approval, reusing the staging image tag; document deploy and rollback (`helm rollback`, RDS PITR) in `docs/runbook.md` and verify with a dry-run promotion

## 11. Integration checks

- [ ] 11.1 Run the full Playwright suite on Chromium, Firefox, and WebKit against staging (name entry → practice → results → progress → drill) and verify all pass
- [ ] 11.2 Run a Lighthouse accessibility audit on `/`, `/practice`, and `/progress` in staging and verify each scores ≥ 95, then complete a manual keyboard-only and screen-reader walkthrough
- [ ] 11.3 Run a rolling deploy on staging under load (k6 continuously saving sessions) and verify there are zero failed requests and p95 save latency is under 300 ms
- [ ] 11.4 Run `openspec validate type-writer-mvp --strict` and verify every scenario in `specs/` maps to at least one passing test
