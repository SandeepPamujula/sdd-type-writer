# Tasks

## 1. Module scaffold

- [x] 1.1 Create `src/lib/scoring.ts` (empty exports) and `src/lib/scoring.test.ts`; verify
      `npm run typecheck` and `npm run lint` pass with no logic yet

## 2. Speed metrics

*Requirement: Speed metrics*

- [x] 2.1 Write failing tests for `calculateSpeed` covering scenarios "Typical session" (500 characters,
      4 uncorrected errors, minutes 2 → Gross WPM 50, Net WPM 48) and "Net WPM never negative" (10
      characters, all incorrect, minutes 2 → Net WPM 0); verify both tests fail (function not implemented)
- [x] 2.2 Implement `SpeedInput`, `SpeedResult`, and `calculateSpeed` per `design.md` (`grossWpm =
      (charactersTyped / 5) / minutes`, `netWpm = max(0, grossWpm - uncorrectedErrors / minutes)`); verify
      both tests from 2.1 pass

## 3. Accuracy

*Requirement: Accuracy*

- [x] 3.1 Write failing tests for `calculateAccuracy` covering scenarios "Corrected mistake still counts"
      (101 total keystrokes, 100 correct → accuracy 100/101 ≈ 0.9901) and "No typing at all" (0 total
      keystrokes → accuracy 0); verify both tests fail
- [x] 3.2 Implement `AccuracyInput` and `calculateAccuracy` (`correctKeystrokes / totalKeystrokes`, `0`
      when `totalKeystrokes` is 0); verify both tests from 3.1 pass

## 4. Score

*Requirement: Score*

- [x] 4.1 Write failing tests for `calculateScore` covering scenarios "Score calculation" (netWpm 50,
      accuracy 0.96 → score 48) and "Verified example" (charactersTyped 153, uncorrectedErrors 1, minutes
      2, correctKeystrokes 152, totalKeystrokes 153 → grossWpm 15.3, netWpm 14.8, accuracy ≈ 0.9935, score
      15 — chained through `calculateSpeed`/`calculateAccuracy`/`calculateScore`); verify both tests fail
- [x] 4.2 Implement `calculateScore` (`Math.round(netWpm * accuracy)`); verify both tests from 4.1 pass

## 5. Displayed values

*Requirement: Displayed values*

- [x] 5.1 Write failing tests for `roundWpmForDisplay` (47.5 → 48) and `roundAccuracyForDisplay` (0.996 →
      99, and the "Verified example" accuracy ≈ 0.9935 → 99) confirming rounding never mutates the
      underlying score inputs; verify both tests fail
- [x] 5.2 Implement `roundWpmForDisplay` (`Math.round`) and `roundAccuracyForDisplay`
      (`Math.floor(accuracy * 100)`); verify both tests from 5.1 pass and `npm run test:coverage` reports
      ≥90% line coverage on `src/lib/scoring.ts`

## 6. Backlog cleanup

- [x] 6.1 Remove the four captured requirements (Speed metrics, Accuracy, Score, Displayed values) from
      the `scoring` Specification section of `docs/requirements-backlog.md`, and remove the
      `add-scoring-metrics` row from the Change plan table; verify the file still lists the remaining
      `scoring` requirements (Results screen, Personal best storage, Personal best message) and the other
      three capabilities untouched, and `npm run spec:validate` passes
