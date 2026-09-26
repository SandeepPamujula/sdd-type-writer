# Spec Delta

## Purpose

Defines how a completed typing session is scored (Gross WPM, Net WPM, accuracy, errors, and per-key error rates) so results are consistent, reproducible, and comparable across sessions.

## ADDED Requirements

### Requirement: Session measurements
The system SHALL record these measurements for every session:
- **Elapsed time**: from the first character keystroke to the completing keystroke, excluding paused time.
- **Typed characters**: the number of characters in the user's input when the session completes.
- **Total keystrokes**: every character keystroke entered, including ones later removed with Backspace. Backspace itself, modifier keys, the resume key, and blocked pastes are not keystrokes.
- **Correct keystrokes**: keystrokes that matched the expected character at the cursor when they were typed.
- **Uncorrected errors**: positions where the final input differs from the passage when the session completes.

#### Scenario: Corrected mistakes still count as keystrokes
- **GIVEN** the passage "cat"
- **WHEN** the user types "x", presses Backspace, then types "c", "a", "t"
- **THEN** total keystrokes is 4 and correct keystrokes is 3
- **AND** uncorrected errors is 0 and typed characters is 3

### Requirement: Words per minute
The system SHALL calculate Gross WPM as (typed characters / 5) / elapsed minutes, and Net WPM as Gross WPM − (uncorrected errors / elapsed minutes), floored at 0. WPM values SHALL be displayed rounded to the nearest whole number.

#### Scenario: Standard calculation
- **GIVEN** a completed session with 250 typed characters, 5 uncorrected errors, and 60 seconds elapsed
- **WHEN** metrics are calculated
- **THEN** Gross WPM is 50 and Net WPM is 45

#### Scenario: Net WPM never goes below zero
- **GIVEN** a completed session with 100 typed characters, 90 uncorrected errors, and 60 seconds elapsed
- **WHEN** metrics are calculated
- **THEN** Gross WPM is 20 and Net WPM is 0

### Requirement: Accuracy
The system SHALL calculate accuracy as correct keystrokes / total keystrokes × 100 and SHALL display it with one decimal place.

#### Scenario: Accuracy includes corrected mistakes
- **GIVEN** a completed session with 260 total keystrokes, of which 247 are correct
- **WHEN** metrics are calculated
- **THEN** accuracy is displayed as 95.0%

### Requirement: Error counts
The results SHALL show uncorrected errors and total errors. Total errors is the number of keystrokes that did not match the expected character, including ones later corrected.

#### Scenario: Both error counts are shown
- **GIVEN** a session with 7 incorrect keystrokes, 5 of which were corrected
- **WHEN** the results screen is shown
- **THEN** it shows 2 uncorrected errors and 7 total errors

### Requirement: Per-key error rates
For every character expected during a session, the system SHALL record how many times it was attempted and how many attempts were incorrect. An incorrect keystroke SHALL count against the expected character, not the character that was typed. Letters SHALL be tracked case-insensitively.

#### Scenario: Error counts against the expected key
- **GIVEN** the expected character is "e"
- **WHEN** the user types "r"
- **THEN** "e" gets 1 attempt and 1 error
- **AND** "r" gets no error from this keystroke

### Requirement: Implausible sessions are rejected
The system SHALL treat a session as invalid, and SHALL NOT calculate WPM for it or save it, when its elapsed time is under 1 second or its Gross WPM is above 300. The user SHALL be told the result could not be recorded.

#### Scenario: Zero-duration session
- **GIVEN** a session whose elapsed time is 0 seconds
- **WHEN** it completes
- **THEN** no WPM is calculated and no division by zero occurs
- **AND** the user sees "This session was too short to score" with an option to try again

#### Scenario: Superhuman speed
- **GIVEN** a completed session whose Gross WPM would be 450
- **WHEN** it is submitted
- **THEN** it is rejected as invalid and not saved

### Requirement: Metrics are verified on the server
The system SHALL recalculate all saved metrics on the server from the recorded session data and SHALL NOT store WPM or accuracy values reported by the browser without checking them.

#### Scenario: Tampered metrics
- **GIVEN** a save request that reports a Net WPM of 150 while its keystroke data works out to 40
- **WHEN** the server processes it
- **THEN** the session is stored with Net WPM 40
