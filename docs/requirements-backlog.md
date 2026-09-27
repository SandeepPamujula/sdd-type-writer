# Typing Tutor — Requirements Backlog

> **This is a shrinking backlog, not the source of truth.**
> The source of truth is `openspec/specs/*/spec.md`. This file holds requirements that have not yet been
> captured by an OpenSpec change. When a change is archived, delete the requirements it covered from this
> file in the same PR. When this file has no requirements left, delete it.
>
> Requirements use SHALL/MUST; each scenario (WHEN/THEN) is an acceptance test.
> Technical decisions live in `docs/adr/`; this file holds only learner-observable behaviour.

## Product context

A static website for practising touch typing. A learner enters their name, types generated
English text for exactly 2 minutes, and gets a score (net WPM × accuracy). Their personal best
is kept in the browser.

### Hard constraints
- No backend, no network calls after the page has loaded, no accounts. All data stays in the browser (localStorage, best-effort).
- Delivered as static files from any static host (see ADR-0001). Built with Next.js static export and TypeScript.
- Must work offline once loaded, at widths from 360 px, with keyboard only, and in light and dark mode.

### Out of scope for v1
Accounts, shared or global leaderboards, score history, custom test durations, custom passages, lesson plans,
sound, a manual theme toggle, resuming a session after reload, and guaranteed typing on touch-screen keyboards.

### Capabilities
1. **user-identity**: name entry, normalisation, remembering and changing the name
2. **typing-session**: the timed 2-minute exercise, passage, feedback and live stats
3. **scoring**: WPM, accuracy, score, results screen and personal best
4. **web-platform**: static delivery, offline use, responsiveness, accessibility and theming

### Change plan (which change captures which requirement)

| # | Change | Requirements to capture (then delete from this file) |
|---|---|---|
| 2 | `add-scoring-metrics` | scoring: Speed metrics, Accuracy, Score, Displayed values |
| 3 | `add-user-identity` | user-identity: Name entry before practice, Name normalisation, Name is displayed safely, Remember last name used |
| 4 | `add-typing-engine` | typing-session: Fixed two-minute duration, Timer starts on first keystroke, Generated practice passage, Keystroke rules, and the character states from Per-character feedback |
| 5 | `add-typing-screen` | typing-session: Per-character feedback (display), Scrolling passage view, Restricted input editing, Typing focus, Live statistics, Restart during a session, Leaving mid-session; web-platform: Screen reader behaviour during a session |
| 6 | `add-results-and-personal-best` | scoring: Results screen, Personal best storage, Personal best message; user-identity: Change name |
| 7 | `harden-accessibility-and-offline` | web-platform: Keyboard-only operation, Accessible labelling, Browser support |

---

## user-identity Specification

### Purpose

Lets a learner identify themselves by name before practising, so that sessions and personal bests are attributed to them, without accounts or a backend.

### Requirements

#### Requirement: Name entry before practice
The system SHALL show a name entry screen when the site is opened, and SHALL NOT allow a typing session to start until a valid name is entered.

##### Scenario: Valid name starts practice
- **WHEN** the user enters "Sandeep" and selects "Start practising" (or presses Enter)
- **THEN** the typing screen is shown with the greeting "Hi, Sandeep"

##### Scenario: Empty name is rejected
- **WHEN** the user submits the form with an empty name or only spaces
- **THEN** the error "Please enter your name." is shown, the typing screen is not shown, and focus returns to the name field

##### Scenario: Error clears while typing a name
- **WHEN** the error is visible and the user types a non-blank character into the name field
- **THEN** the error is hidden

#### Requirement: Name normalisation
The system SHALL accept any Unicode characters in a name. It SHALL trim leading and trailing whitespace, collapse runs of internal whitespace to a single space, and limit the name to 30 user-perceived characters (grapheme clusters), never splitting a character.

##### Scenario: Surrounding and repeated spaces are removed
- **WHEN** the user submits "  Ada   Lovelace  "
- **THEN** the name used everywhere is "Ada Lovelace"

##### Scenario: Name longer than 30 characters
- **WHEN** the user tries to enter more than 30 characters
- **THEN** only the first 30 characters are accepted

##### Scenario: Non-Latin characters and emoji
- **WHEN** the user enters "José 👩‍💻" as their name
- **THEN** the name is accepted as "José 👩‍💻" and counts as 6 characters towards the limit

#### Requirement: Name is displayed safely
The system SHALL render the user's name as plain text and SHALL NOT interpret it as HTML.

##### Scenario: Markup in a name
- **WHEN** the user enters `<b>Sam</b>` as their name
- **THEN** the greeting shows the literal text `<b>Sam</b>` and no bold formatting

#### Requirement: Remember last name used
The system SHALL remember the most recently submitted name in browser storage under the key `typingTutor.v1.lastName` and SHALL pre-fill the name field with it on the next visit.

##### Scenario: Returning user
- **WHEN** a user who previously practised as "Sandeep" reopens the site in the same browser
- **THEN** the name field already contains "Sandeep"

##### Scenario: Storage unavailable
- **WHEN** browser storage is blocked or throws an error
- **THEN** the name field starts empty and the site otherwise works normally

##### Scenario: Stored value is invalid
- **WHEN** the stored last name is not a string or normalises to an empty name
- **THEN** it is ignored and the name field starts empty

#### Requirement: Change name
The system SHALL let the user return to the name entry screen from the results screen via "Change name", with the current name pre-filled and selected.

##### Scenario: Switching user
- **WHEN** the user selects "Change name" on the results screen
- **THEN** the name entry screen is shown with the current name pre-filled and selected, ready to be overwritten

---

## typing-session Specification

### Purpose

Gives the learner a timed, two-minute typing exercise on generated English text, with immediate per-character feedback and live progress statistics.

### Requirements

#### Requirement: Fixed two-minute duration
A typing session SHALL last exactly 120 seconds of elapsed wall-clock time. The timer SHALL keep running while the page is hidden or the window is not focused.

##### Scenario: Session ends at two minutes
- **WHEN** 120 seconds have elapsed since the timer started
- **THEN** the session ends, further input is ignored, and the results screen is shown

##### Scenario: Keystroke at the cutoff
- **WHEN** a keystroke arrives 120 seconds or more after the timer started, before the display has updated
- **THEN** the keystroke is ignored and the session ends immediately

##### Scenario: Tab hidden during a session
- **WHEN** the user switches to another tab 60 seconds into a session and returns 90 seconds later
- **THEN** the session has ended and the results screen is shown

#### Requirement: Timer starts on first keystroke
The countdown SHALL start on the first character the user types, not when the typing screen is shown.

##### Scenario: Waiting before typing
- **WHEN** the typing screen is shown and the user has not typed anything
- **THEN** the timer shows "2:00", the hint "Start typing to begin the timer." is visible, and time does not elapse

##### Scenario: First character typed
- **WHEN** the user types their first character
- **THEN** the countdown starts and the start hint is hidden

#### Requirement: Generated practice passage
The system SHALL generate the passage from a built-in list of at least 200 common English words, each 2–8 lowercase letters (a–z), separated by single spaces, with no punctuation, no capital letters and no word repeated twice in a row. A new passage SHALL start with at least 60 words and SHALL never run out during a session.

##### Scenario: Passage content
- **WHEN** a session is prepared
- **THEN** the passage contains at least 60 words, only lowercase letters and single spaces, and no two consecutive words are identical

##### Scenario: Passage is extended while typing
- **WHEN** fewer than 80 characters of the passage remain ahead of the user's position
- **THEN** more words are appended so the user can keep typing

##### Scenario: New passage per session
- **WHEN** the user starts a new session via "Try again" or "Restart"
- **THEN** a freshly generated passage is shown

#### Requirement: Keystroke rules
Every character entered SHALL count as one keystroke and be compared with the passage character at the current position, including characters produced by holding a key down (auto-repeat), capital letters, and characters produced by dead keys or an input method (counted once, when composition finishes). Enter SHALL be ignored and SHALL NOT count as a keystroke. Tab SHALL keep its normal role of moving keyboard focus. Word-deletion shortcuts (Ctrl+Backspace, Alt+Backspace, Cmd+Backspace) SHALL behave as a single Backspace.

##### Scenario: Capital letter
- **WHEN** the passage character is "a" and the user types "A"
- **THEN** one keystroke is counted and the character is shown as incorrect

##### Scenario: Enter key
- **WHEN** the user presses Enter during a session
- **THEN** nothing is typed, no keystroke is counted, and the position does not change

##### Scenario: Composed character
- **WHEN** the user types "é" using a dead key
- **THEN** exactly one keystroke is counted and the character is shown as incorrect

##### Scenario: Delete-word shortcut
- **WHEN** the user presses Ctrl+Backspace after typing "the qu"
- **THEN** only "u" is removed and the caret moves back one character

##### Scenario: Tab moves focus
- **WHEN** the user presses Tab during a session
- **THEN** focus moves to the next control and no keystroke is counted

#### Requirement: Per-character feedback
Each character of the passage SHALL be shown in one of three states: pending (not yet typed), correct, or incorrect. A caret SHALL mark the next character to type. A mistyped space SHALL be visibly marked as incorrect, including at the end of a line.

##### Scenario: Correct character
- **WHEN** the user types the character matching the passage at the current position
- **THEN** that character is shown as correct (green) and the caret moves forward one character

##### Scenario: Incorrect character
- **WHEN** the user types a character that does not match the passage at the current position
- **THEN** that passage character is shown as incorrect (red with highlighted background) and the caret moves forward one character

##### Scenario: Backspace
- **WHEN** the user presses Backspace
- **THEN** the previous character returns to the pending state and the caret moves back one character

##### Scenario: Backspace at the start
- **WHEN** the caret is at the first character of the passage and the user presses Backspace
- **THEN** nothing changes

#### Requirement: Scrolling passage view
The passage area SHALL show exactly three lines of text. Once the user moves past the first line, the view SHALL scroll so the line being typed is the second visible line. The view SHALL recalculate its lines when the viewport is resized, without affecting the timer or the typed text.

##### Scenario: Moving to a new line
- **WHEN** the caret moves onto the fourth line of the passage
- **THEN** the passage scrolls so that line is the second visible line and no partial lines are visible

##### Scenario: Window resized mid-session
- **WHEN** the viewport width changes during a session so that the text wraps differently
- **THEN** the line containing the caret is still the second visible line (or the first while typing the first line), no partial lines are visible, and the timer and typed text are unchanged

#### Requirement: Restricted input editing
The typing input SHALL only allow appending characters and deleting with Backspace at the end. Pasting, drag-and-drop, arrow keys, Home, End, and select-all SHALL have no effect. Autocorrect, autocapitalisation and spellcheck SHALL be turned off on the typing input.

##### Scenario: Paste attempt
- **WHEN** the user pastes text into the typing area
- **THEN** nothing is inserted and no keystrokes are counted

##### Scenario: Cursor movement attempt
- **WHEN** the user presses an arrow key, Home, End or Ctrl/Cmd+A
- **THEN** the typing position does not change

#### Requirement: Typing focus
The typing input SHALL receive focus when a session is prepared. Clicking the passage SHALL return focus to it. While a session is active and the input loses focus, the passage SHALL show the overlay "Click here to keep typing". The timer SHALL keep running while the overlay is shown.

##### Scenario: Focus lost mid-session
- **WHEN** the user clicks outside the passage during a session
- **THEN** the overlay "Click here to keep typing" appears over the passage and the timer keeps running

##### Scenario: Focus regained
- **WHEN** the user clicks the passage
- **THEN** the overlay disappears and typing continues where it left off

#### Requirement: Live statistics
While on the typing screen, the system SHALL display time remaining (M:SS, rounded up to the whole second), live net WPM, live accuracy, and a progress bar showing elapsed time. Live values SHALL refresh at least every 100 ms while the timer runs. Displayed values SHALL follow the scoring requirement "Displayed values".

##### Scenario: Before any keystrokes
- **WHEN** the typing screen is first shown
- **THEN** it shows time "2:00", WPM "0", accuracy "100%", and an empty progress bar

##### Scenario: During the session
- **WHEN** 30 seconds have elapsed
- **THEN** time shows "1:30", the progress bar is 25% full, and WPM and accuracy reflect keystrokes so far

##### Scenario: Very early in the session
- **WHEN** less than one second has elapsed
- **THEN** live WPM is calculated as if one second had elapsed, to avoid extreme values

#### Requirement: Restart during a session
The typing screen SHALL offer a "Restart" action that abandons the current session without scoring it and prepares a new one.

##### Scenario: Restart mid-session
- **WHEN** the user selects "Restart" while the timer is running
- **THEN** the timer stops, no result or personal best is recorded, and a fresh session with a new passage is shown with the timer at "2:00"

#### Requirement: Leaving mid-session
A session in progress SHALL NOT be saved or resumed. Reloading or leaving the page SHALL abandon it without scoring and without a confirmation prompt.

##### Scenario: Reload during a session
- **WHEN** the user reloads the page while the timer is running
- **THEN** the name entry screen is shown with the last name pre-filled, and no result or personal best is recorded

---

## scoring Specification

### Purpose

Turns a completed two-minute session into a single score plus a breakdown, and tracks each learner's personal best in the browser so they can measure improvement.

### Requirements

#### Requirement: Speed metrics
The system SHALL compute speed using the standard 5-characters-per-word convention, where "characters typed" is the length of the typed text at the end of the session and minutes is 2 for a completed session.
- Gross WPM = (characters typed ÷ 5) ÷ minutes
- Net WPM = max(0, Gross WPM − uncorrected errors ÷ minutes)
- An uncorrected error is a position in the typed text that does not match the passage when the session ends.

##### Scenario: Typical session
- **WHEN** the session ends with 500 characters typed and 4 uncorrected errors
- **THEN** Gross WPM is 50 and Net WPM is 48

##### Scenario: Net WPM never negative
- **WHEN** the session ends with 10 characters typed, all incorrect
- **THEN** Net WPM is 0

#### Requirement: Accuracy
Accuracy SHALL be correct keystrokes ÷ total keystrokes, where every character entered counts as a keystroke and Backspace does not. A mistake SHALL count against accuracy even if it is later corrected. With no keystrokes, accuracy SHALL be 0.

##### Scenario: Corrected mistake still counts
- **WHEN** the user types 100 characters, one of which was wrong and then fixed with Backspace and retyped correctly
- **THEN** there are 101 keystrokes, 100 correct, and accuracy is 99%

##### Scenario: No typing at all
- **WHEN** the timer never starts because nothing was typed
- **THEN** no session ends and no score is produced

#### Requirement: Score
Score SHALL be round(Net WPM × Accuracy), using the unrounded Net WPM and Accuracy as a fraction.

##### Scenario: Score calculation
- **WHEN** Net WPM is 50 and accuracy is 96%
- **THEN** the score is 48

##### Scenario: Verified example
- **WHEN** the session ends with 153 characters typed, 1 mistake made and left uncorrected
- **THEN** Gross WPM is 15, Net WPM is 15, accuracy is 99%, and the score is 15

#### Requirement: Displayed values
Wherever they are shown (live or on the results screen), WPM values SHALL be rounded to the nearest whole number, and accuracy SHALL be shown as a whole percent rounded down, so that 100% is shown only when there were no mistakes. Rounding for display SHALL NOT affect the score calculation.

##### Scenario: Near-perfect accuracy
- **WHEN** accuracy is 99.6%
- **THEN** it is displayed as "99%"

##### Scenario: WPM rounding
- **WHEN** Net WPM is 47.5
- **THEN** it is displayed as "48"

#### Requirement: Results screen
When a session ends, the system SHALL show "Time's up, <name>!", the score prominently, and a breakdown of Net WPM, Accuracy, Gross WPM, Characters typed, Mistakes made (total incorrect keystrokes) and Left uncorrected, formatted as in "Displayed values".

##### Scenario: Results are shown
- **WHEN** the two minutes elapse
- **THEN** the results screen shows the user's name, score and all six breakdown values, and "Try again" has keyboard focus

##### Scenario: Try again
- **WHEN** the user selects "Try again"
- **THEN** a new session starts for the same name, with the timer at "2:00" and a new passage

#### Requirement: Personal best storage
The system SHALL store only one best score per name in browser storage under the key `typingTutor.v1.bests`, as a map from the normalised, lower-cased name to the score. Names SHALL match case-insensitively after normalisation. A score SHALL replace the stored best only if it is greater than 0 and greater than the previous best. No other session data SHALL be stored.

##### Scenario: Beating a previous best
- **WHEN** "Sandeep" has a best of 15 and scores 20
- **THEN** the stored best becomes 20

##### Scenario: Not beating a previous best
- **WHEN** "Sandeep" has a best of 15 and scores 9
- **THEN** the stored best stays 15

##### Scenario: Zero score is never a best
- **WHEN** a name with no stored best scores 0
- **THEN** nothing is stored

##### Scenario: Name case does not matter
- **WHEN** "sandeep" practises after "Sandeep" set a best of 15
- **THEN** the stored best of 15 is used for comparison

##### Scenario: Storage unavailable
- **WHEN** browser storage is blocked or throws an error
- **THEN** the results screen still shows the score and breakdown, and the best is treated as absent

##### Scenario: Stored data is corrupt
- **WHEN** the stored bests are not valid JSON or a name's value is not a positive number
- **THEN** the affected best is treated as absent and the site keeps working

#### Requirement: Personal best message
The results screen SHALL show exactly one personal-best message, chosen as follows:
- New best with a previous best: "New personal best! Previous best: <n>." (highlighted)
- New best with no previous best: "Your first score. Try again to beat it!" (highlighted)
- Not a new best: "Personal best: <n>."
- Score of 0 with no previous best: no message

##### Scenario: New best over a previous one
- **WHEN** "Sandeep" has a best of 15 and scores 20
- **THEN** "New personal best! Previous best: 15." is shown, highlighted

##### Scenario: First ever score
- **WHEN** a name with no stored best scores 12
- **THEN** "Your first score. Try again to beat it!" is shown, highlighted

##### Scenario: Below the best
- **WHEN** "Sandeep" has a best of 15 and scores 9
- **THEN** "Personal best: 15." is shown

---

## web-platform Specification

### Purpose

Defines the delivery and quality constraints of the typing tutor: a static, backend-free site that works offline, on small screens, with a keyboard only, and in light or dark mode.

### Requirements

#### Requirement: Keyboard-only operation
Every action (enter name, start, type, restart, try again, change name) SHALL be possible with the keyboard alone, with a visible focus indicator on interactive controls.

##### Scenario: Full flow without a mouse
- **WHEN** a user completes name entry, a session and "Try again" using only the keyboard
- **THEN** every step succeeds and the focused control is always visible

#### Requirement: Accessible labelling
Form fields SHALL have accessible labels and validation errors SHALL be announced to assistive technology.

##### Scenario: Screen reader on name error
- **WHEN** an empty name is submitted
- **THEN** the error message is exposed as an alert

#### Requirement: Screen reader behaviour during a session
The typing input SHALL have an accessible label. Individual keystrokes and the live statistics SHALL NOT be announced as they change. The time remaining SHALL be exposed with the timer role. The end of the session SHALL be conveyed by moving focus to the results screen.

##### Scenario: Typing with a screen reader
- **WHEN** a screen-reader user types during a session
- **THEN** the live WPM, accuracy and time are not announced on every update

##### Scenario: Session ends with a screen reader
- **WHEN** the two minutes elapse
- **THEN** focus moves to "Try again" on the results screen, so the change of screen is announced
