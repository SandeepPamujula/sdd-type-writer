# Spec Delta

## Purpose

Turns a completed two-minute session into a single score plus a breakdown, from the session's raw
character and keystroke counts, using the standard 5-characters-per-word convention.

## ADDED Requirements

### Requirement: Speed metrics
The system SHALL compute speed using the standard 5-characters-per-word convention, where "characters typed" is the length of the typed text at the end of the session and minutes is 2 for a completed session.
- Gross WPM = (characters typed ÷ 5) ÷ minutes
- Net WPM = max(0, Gross WPM − uncorrected errors ÷ minutes)
- An uncorrected error is a position in the typed text that does not match the passage when the session ends.

#### Scenario: Typical session
- **WHEN** the session ends with 500 characters typed and 4 uncorrected errors
- **THEN** Gross WPM is 50 and Net WPM is 48

#### Scenario: Net WPM never negative
- **WHEN** the session ends with 10 characters typed, all incorrect
- **THEN** Net WPM is 0

### Requirement: Accuracy
Accuracy SHALL be correct keystrokes ÷ total keystrokes, where every character entered counts as a keystroke and Backspace does not. A mistake SHALL count against accuracy even if it is later corrected. With no keystrokes, accuracy SHALL be 0.

#### Scenario: Corrected mistake still counts
- **WHEN** the user types 100 characters, one of which was wrong and then fixed with Backspace and retyped correctly
- **THEN** there are 101 keystrokes, 100 correct, and accuracy is 99%

#### Scenario: No typing at all
- **WHEN** the timer never starts because nothing was typed
- **THEN** no session ends and no score is produced

### Requirement: Score
Score SHALL be round(Net WPM × Accuracy), using the unrounded Net WPM and Accuracy as a fraction.

#### Scenario: Score calculation
- **WHEN** Net WPM is 50 and accuracy is 96%
- **THEN** the score is 48

#### Scenario: Verified example
- **WHEN** the session ends with 153 characters typed, 1 mistake made and left uncorrected
- **THEN** Gross WPM is 15, Net WPM is 15, accuracy is 99%, and the score is 15

### Requirement: Displayed values
Wherever they are shown (live or on the results screen), WPM values SHALL be rounded to the nearest whole number, and accuracy SHALL be shown as a whole percent rounded down, so that 100% is shown only when there were no mistakes. Rounding for display SHALL NOT affect the score calculation.

#### Scenario: Near-perfect accuracy
- **WHEN** accuracy is 99.6%
- **THEN** it is displayed as "99%"

#### Scenario: WPM rounding
- **WHEN** Net WPM is 47.5
- **THEN** it is displayed as "48"
