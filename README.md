# SDD Type Writer

A static typing-tutor website. You enter your name, type generated English text for exactly 2 minutes, and get
a score of `round(net WPM × accuracy)`. Your personal best is saved in the browser's `localStorage`.

There is no backend. The app is built with **Next.js** (static export), **React** and **TypeScript**, and is
deployed to **GitHub Pages**.

> **Status:** early stage. Right now the app only shows a "Typing Tutor" heading. The typing features are
> being added one OpenSpec change at a time (see section 8, "How we work").

---

## 1. Prerequisites

Install these before you start:

| Tool    | Version            | How to check     | Where to get it                               |
| ------- | ------------------ | ---------------- | --------------------------------------------- |
| Git     | any recent version | `git --version`  | https://git-scm.com/downloads                 |
| Node.js | **24.13.0**        | `node --version` | https://nodejs.org (or use a version manager) |
| npm     | comes with Node    | `npm --version`  | installed with Node.js                        |

The exact Node version is in [.nvmrc](.nvmrc). `package.json` requires Node `^24.13.0`, so older versions
will not work.

**Tip: use a Node version manager** so you can switch versions per project:

- macOS / Linux: [nvm](https://github.com/nvm-sh/nvm), then run `nvm use` in the project folder.
- Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows), then run `nvm install 24.13.0` and
  `nvm use 24.13.0`.

A code editor such as [VS Code](https://code.visualstudio.com/) is recommended. Install its ESLint and
Prettier extensions to see lint errors and format on save.

---

## 2. Get the code

```bash
git clone <repository-url>
cd sdd-type-writer
```

Replace `<repository-url>` with the URL from the green **Code** button on GitHub.

---

## 3. Install dependencies

```bash
npm install
```

This reads `package.json` and `package-lock.json` and downloads everything into `node_modules/`. It can take
a minute or two the first time.

> Use `npm ci` instead if you want an exact, clean install that matches `package-lock.json` (this is what CI
> does).

---

## 4. Run the app

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. You should see the "Typing Tutor" heading.

The dev server reloads the page automatically when you save a file. Stop it with `Ctrl + C` in the terminal.

---

## 5. Everyday commands

Run all of these from the project root folder.

| Command                  | What it does                                                                 |
| ------------------------ | ---------------------------------------------------------------------------- |
| `npm run dev`            | Starts the dev server at http://localhost:3000 with hot reload.              |
| `npm run build`          | Builds the production site into the `out/` folder (plain HTML/CSS/JS files). |
| `npm run lint`           | Checks the code with ESLint.                                                 |
| `npm run typecheck`      | Checks TypeScript types without building.                                    |
| `npm test`               | Runs the unit tests (Jest).                                                  |
| `npm run test:coverage`  | Runs the unit tests and checks coverage (`src/lib` must have ≥ 90% lines).   |
| `npm run e2e`            | Builds the site and runs the browser tests (Playwright). See section 6.      |
| `npm run spec:validate`  | Validates the OpenSpec specs. See section 8.                                 |
| `npx prettier --write .` | Formats all files with Prettier.                                             |

### Preview the production build

`npm run dev` is for development. To see exactly what gets deployed:

```bash
npm run build
npx serve out -l 3000
```

Then open http://localhost:3000.

---

## 6. Running the tests

### Unit tests (Jest)

```bash
npm test
```

Unit tests live next to the code they test and end in `.test.ts` or `.test.tsx`
(for example [src/styles/tokens.test.ts](src/styles/tokens.test.ts)).

To re-run tests automatically when you save a file:

```bash
npx jest --watch
```

### End-to-end tests (Playwright)

The first time only, download the browser Playwright uses:

```bash
npx playwright install chromium
```

Then run:

```bash
npm run e2e
```

This builds the site, serves it on port 3000, and runs the tests in [e2e/](e2e/) in Chromium. After a run,
open the HTML report with:

```bash
npx playwright show-report
```

> **Port 3000 must be free.** Stop `npm run dev` before running `npm run e2e`, otherwise Playwright will reuse
> the dev server instead of the production build. One test also uses port 3100.

---

## 7. Before you open a pull request

CI runs these checks on every pull request to `main`, and the PR cannot be merged if any fail. Run them
locally first to save time:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run e2e
npm run spec:validate
```

Also:

- Work on a branch, not on `main`. Branch names follow `feature/<change-name>`.
- Write commit messages in [Conventional Commits](https://www.conventionalcommits.org/) style, for example
  `feat: add countdown timer` or `fix: handle empty name`.

---

## 8. How we work: spec-driven development

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec). Every feature starts as a written
**change** (proposal, design, specs, tasks) before any code is written.

- [openspec/specs/](openspec/specs/): the source of truth for how the app behaves.
- [openspec/changes/](openspec/changes/): changes in progress. Each has a `proposal.md`, `design.md`,
  `tasks.md` and delta specs.
- [docs/requirements-backlog.md](docs/requirements-backlog.md): requirements not yet turned into specs, and
  which change will pick each one up.
- [docs/adr/](docs/adr/): Architecture Decision Records that explain _why_ the stack looks the way it does.
- [docs/architecture/c4.md](docs/architecture/c4.md): architecture diagrams.

`npm run spec:validate` needs the OpenSpec CLI. If the command is not found, run it through `npx` (this is
the same version CI uses):

```bash
npx --yes @fission-ai/openspec@1.13.2 validate --all --strict
```

### Example: how the `web-platform` change was built

The slash commands (`/opsx:...`) below are OpenSpec skills; each one runs `openspec` CLI commands under the
hood. This is the actual sequence used for this change, in order:

| Step | Skill            | What it did                                                                                          |
| ---- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| 1    | `/opsx:new`      | `openspec new change web-platform` — scaffolded `openspec/changes/web-platform/` (schema `spec-driven`). |
| 2    | `/opsx:continue` | Wrote `proposal.md` (why, what changes, which capabilities).                                          |
| 3    | `/opsx:continue` | Wrote `specs/web-platform/spec.md` (the delta spec: requirements + scenarios).                        |
| 4    | `/opsx:continue` | Wrote `design.md` (technical approach, decisions, test seams).                                        |
| 5    | `/opsx:continue` | Wrote `tasks.md` (15 checkboxed, test-first implementation tasks).                                    |
| 6    | `/opsx:apply`    | Implemented all 15 tasks, checking each off only once its own verification step passed.               |
| 7    | `/opsx:verify`   | Cross-checked tasks, spec requirements, scenarios and design decisions against the real code; produced a report (0 critical, 0 warning, 2 minor suggestions). |

Next up once this is merged: `/opsx:archive`, which moves `specs/web-platform/spec.md` into
`openspec/specs/web-platform/spec.md` — the real source of truth — and closes out the change.

Each step above calls `openspec` directly; the ones you're most likely to run by hand are:

```bash
openspec status --change web-platform --json   # artifact progress (which of proposal/specs/design/tasks are done)
openspec validate web-platform --strict         # validate one change against schema rules
openspec list --specs                           # inventory of ARCHIVED capabilities (empty until a change is archived)
```

> `openspec list --specs` reads `openspec/specs/`, which only gets populated by `/opsx:archive`. Until a
> change is archived, its spec lives as a delta under `openspec/changes/<name>/specs/`, and `list --specs`
> will correctly report "No specs found."

---

## 9. Project structure

```
app/                 Next.js App Router: layout, the single page (/), global styles
src/
  components/        React UI components
  lib/               Pure logic (no React or DOM imports) — must have ≥ 90% test coverage
  styles/            CSS custom-property design tokens (colours, spacing, light/dark theme)
e2e/                 Playwright end-to-end tests
docs/                Requirements backlog, ADRs, architecture diagrams
openspec/            Specs and in-progress changes
.github/workflows/   CI and GitHub Pages deployment
```

### Rules to keep in mind

These come from the ADRs and are checked by tests or review:

- **No backend and no network requests after the page loads.** Everything runs in the browser.
- **No third-party origins.** No Google Fonts, CDNs or external scripts; use system fonts only.
- **Wrap every `localStorage` call in `try/catch`.** It can throw (for example in private browsing).
- **Render user text as text.** Never use `dangerouslySetInnerHTML`.
- **Styling:** CSS Modules plus the tokens in [src/styles/tokens.css](src/styles/tokens.css). Light/dark
  theme follows the operating system setting.
- **Layout must work from 360 px wide** with no horizontal scrolling.

---

## 10. Deployment

You don't deploy by hand. When a PR is merged into `main`, the [CI workflow](.github/workflows/ci.yml) runs
all checks, builds the site with `NEXT_PUBLIC_BASE_PATH=/sdd-type-writer`, and publishes the `out/` folder to
GitHub Pages.

The site is served under a sub-path (`/sdd-type-writer/`), so the build needs to know that prefix. To test a
sub-path build locally:

```bash
# macOS / Linux / Git Bash
NEXT_PUBLIC_BASE_PATH=/sdd-type-writer npm run build
```

```powershell
# Windows PowerShell
$env:NEXT_PUBLIC_BASE_PATH = "/sdd-type-writer"; npm run build; Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

Then run `npx serve out -l 3000` and open http://localhost:3000/sdd-type-writer/.

> Running `npx serve out` without a sub-path build and opening `/sdd-type-writer/` (or the other way round)
> will show a page with missing styles. That's expected: rebuild with the matching base path.

---

## 11. Troubleshooting

| Problem                                                 | Fix                                                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm install` warns `EBADENGINE` / "Unsupported engine" | Your Node version is wrong. Install Node 24.13.0 (see section 1) and run `npm install` again.       |
| `Port 3000 is in use`                                   | Another process (often an old `npm run dev`) is using it. Stop it, or run `npm run dev -- -p 3001`. |
| Playwright says `Executable doesn't exist`              | Run `npx playwright install chromium`.                                                              |
| `openspec: command not found`                           | Use the `npx --yes @fission-ai/openspec@1.13.2 ...` command from section 8.                         |
| `test:coverage` fails on coverage threshold             | Add tests for the code you changed in `src/lib/` until line coverage is at least 90%.               |
| Strange build errors after switching branches           | Delete the `.next/` and `out/` folders and run `npm install` again.                                 |
| Page loads without styles after `npm run build`         | You built with a different `NEXT_PUBLIC_BASE_PATH` than the URL you opened. See section 10.         |
