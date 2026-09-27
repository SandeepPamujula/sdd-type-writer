# Proposal

## Why

A completed typing session produces raw data (characters typed, keystrokes, mistakes) that means nothing
to a learner on its own. This change adds the pure calculation that turns that raw data into the speed,
accuracy and score numbers every later screen (live stats, results, personal best) needs to display.

## What Changes

- Add a `scoring` capability: Gross WPM, Net WPM, Accuracy, and Score calculations from characters typed,
  uncorrected errors, and keystroke counts, per the standard 5-characters-per-word convention.
- Add the shared display-rounding rule (WPM to the nearest whole number, accuracy to a whole percent
  rounded down) used wherever a WPM or accuracy value is shown, without affecting the underlying score
  calculation.
- Add a pure `src/lib/scoring.ts` module (no React/DOM imports) exposing these calculations as plain
  functions, so the typing session and results screen can consume them once they exist.

## Capabilities

### New Capabilities
- `scoring`: computing Gross WPM, Net WPM, Accuracy and Score from a completed (or in-progress) session's
  raw counts, and the shared rounding rule for displaying WPM and accuracy values. This change captures
  only the four calculation requirements (Speed metrics, Accuracy, Score, Displayed values) from the full
  `scoring` capability described in `docs/requirements-backlog.md`; the rest are deferred (see Non-goals).

### Modified Capabilities
_None — no other capability specs exist yet._

## Impact

- New: `src/lib/scoring.ts` (pure functions: gross/net WPM, accuracy, score, display rounding),
  `src/lib/scoring.test.ts`.
- No UI is added or changed — there is no typing session, results screen, or personal-best storage yet
  to call this module. Those arrive with `add-typing-engine`, `add-typing-screen`, and
  `add-results-and-personal-best`.
- No existing code is modified.

## Requirements captured from the backlog

From `docs/requirements-backlog.md`, capability `scoring`:
- Speed metrics
- Accuracy
- Score
- Displayed values

## Non-goals

Deliberately left for later changes:
- `scoring`: Results screen, Personal best storage, Personal best message — captured by
  `add-results-and-personal-best`, since they need the results UI and localStorage to exist first.
- Wiring these functions into a live typing session (calling them on a timer, from real keystrokes) —
  captured by `add-typing-engine` and `add-typing-screen`. This change only adds the calculations
  themselves, tested against fixed inputs.
