# Design

## Context

No `src/lib` modules exist yet ([bootstrap-web-platform](../web-platform/design.md) added only the empty
directory). There is also no typing engine yet (`add-typing-engine` is later in the backlog's change
plan), so this module has no real caller until then — it is specified and tested against fixed inputs
only, per `specs/scoring/spec.md`. See `proposal.md` - Why for motivation.

Per the architecture in `openspec/config.yaml`, `src/lib` modules are pure functions with no React or DOM
imports, so a future `add-typing-engine`/`add-typing-screen`/`add-results-and-personal-best` change can
import and call them from wherever it tracks session state, without this module knowing about the DOM,
timers, or React.

## Goals / Non-Goals

**Goals:**
- A pure, dependency-free `src/lib/scoring.ts` implementing exactly the four calculations in
  `specs/scoring/spec.md`: Gross/Net WPM, Accuracy, Score, and display rounding.
- Function signatures shaped so a later change can call them both for the final result (minutes = 2) and
  for live in-session stats (minutes = elapsed time so far), without changing this module.
- ≥90% line coverage on this file, per ADR-0003's `src/lib` coverage gate.

**Non-Goals:**
- Tracking keystrokes, characters typed, or elapsed time — that state lives in the typing engine
  (`add-typing-engine`), not here. This module only transforms counts it is given.
- The 1-second floor for "very early in the session" live WPM (typing-session spec, "Live statistics") —
  that clamping is the caller's responsibility when it computes `minutes` for a live (not yet completed)
  session; this module just divides by whatever `minutes` it receives.
- Formatting a value as a display string (e.g. adding "%" or "Score: ") — out of scope until there is a
  results/live-stats UI (`add-typing-screen`, `add-results-and-personal-best`). This module exposes
  numeric rounding only (e.g. `47.5 → 48`, `0.996 → 99`); the UI layer appends units/labels.

## Decisions

**One small module, four functions, plain-data in/out** — `calculateSpeed`, `calculateAccuracy`,
`calculateScore`, and two display-rounding helpers. No class, no shared mutable state, no config object
threading through them; each requirement in the spec maps to exactly one function so a reviewer can check
spec ↔ code 1:1.

```ts
// src/lib/scoring.ts

export interface SpeedInput {
  charactersTyped: number;   // length of typed text so far / at session end
  uncorrectedErrors: number; // positions where typed text != passage, at the moment of calculation
  minutes: number;           // 2 for a completed session; elapsed minutes for a live/in-progress one
}
export interface SpeedResult {
  grossWpm: number; // (charactersTyped / 5) / minutes
  netWpm: number;   // max(0, grossWpm - uncorrectedErrors / minutes)
}
export function calculateSpeed(input: SpeedInput): SpeedResult;

export interface AccuracyInput {
  correctKeystrokes: number;
  totalKeystrokes: number;
}
export function calculateAccuracy(input: AccuracyInput): number; // fraction 0..1; 0 when totalKeystrokes is 0

export function calculateScore(netWpm: number, accuracy: number): number; // round(netWpm * accuracy)

export function roundWpmForDisplay(wpm: number): number;       // Math.round
export function roundAccuracyForDisplay(accuracy: number): number; // Math.floor(accuracy * 100), 0..100
```

**`minutes` as an explicit input, not a hard-coded 2** — Requirement text fixes minutes at 2 for a
*completed* session, but "Live statistics" (typing-session spec, deferred to `add-typing-engine`) needs
the same Gross/Net WPM formula recomputed continuously with the elapsed fraction of a minute. Taking
`minutes` as a parameter lets that future change reuse `calculateSpeed` unchanged instead of duplicating
the formula. Alternative considered: hard-code `minutes = 2` inside the function and give live stats its
own copy of the formula — rejected, it would violate the spec's single formula and risk the two
implementations drifting.

**Accuracy takes keystroke counts, not the typed string** — Accuracy must count a corrected mistake
against the learner even after it's fixed (spec scenario "Corrected mistake still counts"), which the
final typed string alone cannot tell you (a fixed character now matches). So the caller must track
running `correctKeystrokes`/`totalKeystrokes` counters as keystrokes happen; this module just divides
them. This is the one place the spec dictates behavior the module's inputs must support, so the shape of
`AccuracyInput` is fixed by the spec, not a free design choice.

**Display rounding returns numbers, not strings** — `roundAccuracyForDisplay` returns `99` (not `"99%"`)
and `roundWpmForDisplay` returns `48` (not `"48"`). Keeps this module free of formatting/i18n concerns;
the future UI component owns turning a number into the exact on-screen text. Alternative considered:
return pre-formatted strings — rejected as premature, since there is no UI yet to define the surrounding
text (e.g. whether a label precedes the number).

**Test seams**: `calculateSpeed`, `calculateAccuracy`, `calculateScore`, `roundWpmForDisplay`,
`roundAccuracyForDisplay` — all five are exported pure functions, each covered directly by a unit test
per spec scenario (`src/lib/scoring.test.ts`).

## Risks / Trade-offs

- [Risk] Floating-point rounding (e.g. `0.99 * 100` not being exactly `99`) could make
  `roundAccuracyForDisplay` off-by-one at a boundary → Mitigation: use `Math.floor` on the product directly
  (`Math.floor(accuracy * 100)`) and cover the boundary scenario ("Near-perfect accuracy", 99.6% → "99%")
  with an explicit unit test.
- [Risk] A future change could accidentally call `calculateScore` with an already-rounded Net WPM or
  accuracy, double-rounding the score → Mitigation: the spec and this design both state score uses
  unrounded inputs; the unit test for "Score calculation" and "Verified example" pins the exact expected
  output for known unrounded inputs, so a regression is caught immediately.

## Migration Plan

No migration — this adds a new, currently-uncalled module. Nothing depends on it yet, so there is no
rollout risk; rollback is `git revert` of this change's commit.
