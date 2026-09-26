# Spec Delta

## Purpose

Defines a single typing practice session: presenting a passage, capturing what the user types, giving live per-character feedback, and deciding when the session starts, pauses, and ends.

## ADDED Requirements

### Requirement: Passage selection
The system SHALL start each session with a passage from a built-in library. Passages SHALL be 100 to 400 characters long, SHALL contain only characters that can be typed on a standard US QWERTY keyboard, and SHALL use single spaces with no line breaks. When the library has more than one passage, the system SHALL NOT pick the passage the user has just completed.

#### Scenario: New session gets a passage
- **GIVEN** a named user on the practice screen
- **WHEN** a new session starts
- **THEN** the system shows a passage of 100–400 typeable characters
- **AND** every character is shown as pending

#### Scenario: Consecutive passages differ
- **GIVEN** a user who has just completed passage P
- **WHEN** they choose "Next passage"
- **THEN** the new session uses a passage other than P

### Requirement: Timer starts on first keystroke
The session timer SHALL start on the user's first character keystroke, not when the passage is shown. The system SHALL show elapsed time and live Net WPM while the session is running, updated at least once per second.

#### Scenario: Idle before typing does not count
- **GIVEN** a passage has been shown for 20 seconds with no typing
- **WHEN** the user types the first character
- **THEN** the elapsed time starts at 0 from that keystroke

### Requirement: Per-character feedback
The system SHALL compare each typed character with the expected character at the cursor, case-sensitively, and SHALL immediately mark it as correct or incorrect. An incorrect keystroke SHALL still advance the cursor. Correct, incorrect, pending, and current-position states SHALL be told apart by more than color alone.

#### Scenario: Correct character
- **GIVEN** the expected character is "T"
- **WHEN** the user types "T"
- **THEN** that character is marked correct and the cursor moves to the next character

#### Scenario: Incorrect character, including wrong case
- **GIVEN** the expected character is "T"
- **WHEN** the user types "t"
- **THEN** that character is marked incorrect with a non-color indicator (such as an underline)
- **AND** the cursor moves to the next character

#### Scenario: Modifier and non-character keys are ignored
- **GIVEN** a running session
- **WHEN** the user presses Shift, Ctrl, Alt, an arrow key, or a function key on its own
- **THEN** no character is entered and no keystroke is counted

### Requirement: Backspace corrections
The system SHALL let the user press Backspace to remove the most recently typed character. The removed position SHALL go back to pending, and the cursor SHALL NOT move before the first character. Keystrokes that were later corrected SHALL still count toward accuracy.

#### Scenario: Correcting a mistake
- **GIVEN** the user typed "Teh" while the expected text is "The"
- **WHEN** they press Backspace twice and type "he"
- **THEN** all three characters are marked correct
- **AND** the two original wrong keystrokes still count toward accuracy

#### Scenario: Backspace at the start
- **GIVEN** a session where no characters have been typed
- **WHEN** the user presses Backspace
- **THEN** nothing changes and the timer does not start

### Requirement: Paste and drop are blocked
The system SHALL NOT accept text that is pasted or dragged into the practice area. It SHALL show a short notice that pasting is disabled.

#### Scenario: User pastes text
- **GIVEN** a running session
- **WHEN** the user pastes text
- **THEN** no characters are entered, the cursor does not move, and no keystrokes are counted
- **AND** the notice "Pasting is disabled during practice" is shown

### Requirement: Pause on focus loss
The system SHALL pause a running session when the practice area loses focus, the browser tab is hidden, or the window is minimized. Paused time SHALL be excluded from elapsed time. The session SHALL resume when the user returns and presses a key.

#### Scenario: Switching tabs
- **GIVEN** a running session at 30 seconds elapsed
- **WHEN** the user switches to another tab for 2 minutes and then returns
- **THEN** the session shows as paused with the prompt "Press any key to resume"
- **AND** elapsed time is still 30 seconds

#### Scenario: Resuming
- **GIVEN** a paused session
- **WHEN** the user presses a key
- **THEN** the session resumes and the timer continues from where it paused
- **AND** the key that resumed the session is not entered as a character

### Requirement: Session completion
A session SHALL complete when the user types a character at the last position of the passage, whether that character is correct or not. On completion the system SHALL stop the timer, stop accepting input, and show the results screen.

#### Scenario: Finishing a passage
- **GIVEN** the cursor is at the last character of the passage
- **WHEN** the user types any character
- **THEN** the session completes and the results screen is shown

### Requirement: Restart and abandon
The system SHALL let the user restart the current passage or switch to a new passage at any time. Sessions that are restarted, switched, or left before they complete SHALL NOT be saved.

#### Scenario: Restart with Escape
- **GIVEN** a running session
- **WHEN** the user presses Escape
- **THEN** the same passage is reset with all characters pending and the timer cleared
- **AND** nothing is saved for the interrupted attempt

#### Scenario: Leaving mid-session
- **GIVEN** a running session
- **WHEN** the user navigates to the progress page
- **THEN** the unfinished session is discarded and not saved

### Requirement: Practice requires a physical keyboard
On devices whose primary input is touch, the system SHALL NOT start practice sessions. It SHALL explain that practice needs a physical keyboard and SHALL still let the user view their progress.

#### Scenario: Visiting on a phone
- **GIVEN** a user on a touch-only phone
- **WHEN** they open the practice screen
- **THEN** they see "Typing practice needs a physical keyboard"
- **AND** a link to their progress page

### Requirement: Accessible practice screen
The practice screen SHALL be operable with the keyboard alone, SHALL expose the passage text and all controls with labels screen readers announce, SHALL announce pause, resume, and completion to assistive technology, SHALL meet WCAG 2.1 AA contrast, and SHALL respect the user's reduced-motion setting.

#### Scenario: Keyboard-only flow
- **GIVEN** a keyboard-only user
- **WHEN** they start a session, type the passage, and reach the results screen
- **THEN** every step works without a pointer and focus is always visible

#### Scenario: Reduced motion
- **GIVEN** the operating system is set to reduce motion
- **WHEN** the practice screen is shown
- **THEN** the cursor does not blink or animate
