# Proposal

## Why

People who want to type faster need a fast, low-friction way to practice and a clear signal of whether they are improving. This change delivers the first usable version of Type Writer: enter a name, practice, see your speed, and watch it improve.

## What Changes

- New Next.js web app where a user enters a display name (no password) and starts practicing immediately; the name is remembered on return visits.
- Practice screen that shows a passage from a built-in library, highlights each character as correct, incorrect, or pending while the user types, and handles backspace corrections.
- Results screen after each session showing Net WPM, Gross WPM, accuracy, error count, and elapsed time, calculated with the project's standard metric definitions.
- Progress page listing past sessions with WPM and accuracy trends, plus the user's weakest keys and a practice drill that targets them.
- Health endpoint, container image, Helm chart, and Terraform so the app runs on Amazon EKS with PostgreSQL on Amazon RDS.

## Capabilities

### New Capabilities
- `user-identity`: Entering, validating, and remembering a display name; no authentication.
- `typing-session`: Passage selection, keystroke capture, per-character feedback, corrections, timer start/finish, and focus-loss handling.
- `typing-metrics`: Calculating Gross WPM, Net WPM, accuracy, errors, and per-key error rates from a completed session.
- `progress-tracking`: Saving sessions, showing history and trends, identifying weakest keys, and generating weak-key practice drills.
- `platform-operations`: Health checking, configuration through environment variables, and running as stateless, horizontally scalable instances.

### Modified Capabilities
- None (no existing specs).

## Non-goals

- Accounts, passwords, OAuth, or protecting a name from being used by someone else.
- Multiplayer races, leaderboards, or social sharing.
- Typing practice on mobile/touch devices (mobile is view-only).
- Custom user-uploaded passages, multiple languages, or non-QWERTY layout support.
- Gamification (badges, streaks) and paid features.

## Success metrics

- A new user can start their first session within 10 seconds of opening the app.
- At least 60% of users who finish one session finish a third.
- Among users with 10 or more sessions, median Net WPM rises from their first 3 sessions to their last 3.
- Keystroke feedback renders in under 16 ms; p95 latency to save a session is under 300 ms.
- Lighthouse accessibility score of at least 95; the full practice flow works with the keyboard alone.
- Rolling deploys on EKS cause no failed requests.

## Impact

- **UI**: All new: name entry, practice, results, and progress pages.
- **API**: New Route Handlers/Server Actions for creating users, saving sessions, reading progress, and `/api/health`.
- **Database schema**: New PostgreSQL schema (users, passages, sessions, per-key stats) managed with Prisma migrations.
- **Kubernetes/infra**: New Dockerfile, ECR repository, Helm chart (Deployment, Service, ALB Ingress, HPA, probes), Secrets Manager integration, Terraform for EKS/RDS, and a GitHub Actions pipeline.
- **Risk**: With no authentication, anyone entering the same name sees that name's history; accepted for v1.
