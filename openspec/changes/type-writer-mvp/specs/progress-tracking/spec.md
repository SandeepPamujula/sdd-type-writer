# Spec Delta

## Purpose

Keeps a history of each user's completed sessions and turns it into feedback (trends, personal bests, weakest keys, and targeted drills) that helps them improve their typing speed.

## ADDED Requirements

### Requirement: Save completed sessions
The system SHALL automatically save every valid completed session for the current user. Each saved session SHALL include its completion time, passage, Gross WPM, Net WPM, accuracy, uncorrected and total errors, elapsed time, per-key statistics, and whether it was a weak-key drill.

#### Scenario: Session is saved
- **GIVEN** user "Grace" completes a valid session
- **WHEN** the results screen appears
- **THEN** the session is saved to Grace's history
- **AND** it appears on Grace's progress page

#### Scenario: Save fails
- **GIVEN** the service is temporarily unavailable
- **WHEN** a completed session cannot be saved
- **THEN** the results are still shown
- **AND** the user is told the session was not saved and can retry without retyping the passage

#### Scenario: Retrying does not create duplicates
- **GIVEN** a session save that succeeded on the server but whose response never reached the browser
- **WHEN** the user retries the save
- **THEN** the session is stored only once

### Requirement: Personal best
The system SHALL track each user's highest Net WPM and SHALL highlight on the results screen when a session sets a new personal best.

#### Scenario: New personal best
- **GIVEN** a user whose best Net WPM is 48
- **WHEN** they complete a session with a Net WPM of 52
- **THEN** the results screen shows "New personal best!"
- **AND** their personal best becomes 52

### Requirement: Session history
The progress page SHALL list the user's saved sessions from newest to oldest, showing date and time, Net WPM, accuracy, and elapsed time, 20 sessions per page.

#### Scenario: History with sessions
- **GIVEN** a user with 25 saved sessions
- **WHEN** they open the progress page
- **THEN** the 20 most recent sessions are listed newest first, with a way to see the other 5

#### Scenario: No sessions yet
- **GIVEN** a user with no saved sessions
- **WHEN** they open the progress page
- **THEN** they see "No sessions yet" and a button to start practicing

### Requirement: Trends
The progress page SHALL show how Net WPM and accuracy changed over the user's last 30 sessions. It SHALL also give a text summary comparing the average Net WPM of the last 10 sessions with the 10 before them. Every chart SHALL have an equivalent text or table alternative.

#### Scenario: Improvement summary
- **GIVEN** a user whose last 10 sessions average 45 Net WPM and whose previous 10 averaged 40
- **WHEN** they view the progress page
- **THEN** the summary reads "Up 5 WPM compared with your previous 10 sessions"

#### Scenario: Not enough data for a comparison
- **GIVEN** a user with fewer than 20 saved sessions
- **WHEN** they view the progress page
- **THEN** the chart shows the sessions they have
- **AND** the comparison summary is replaced by "Complete 20 sessions to see your trend"

#### Scenario: Chart is accessible
- **GIVEN** a screen reader user on the progress page
- **WHEN** they reach the trend chart
- **THEN** they can read the same data as a table or text

### Requirement: Weakest keys
The system SHALL identify up to 5 of the user's weakest keys: the keys with the highest error rate across their last 20 saved sessions, counting only keys with at least 10 attempts in that window. Ties SHALL be broken by the greater number of errors.

#### Scenario: Weakest keys are shown
- **GIVEN** a user whose "q", "z", and ";" keys have the highest error rates, each with at least 10 attempts
- **WHEN** they view the progress page
- **THEN** those keys are listed with their error rates, highest first

#### Scenario: Not enough data
- **GIVEN** a user for whom no key has 10 attempts in the window
- **WHEN** they view the progress page
- **THEN** they see "Keep practicing to find your weakest keys" instead of a list

### Requirement: Weak-key practice drills
When a user has weakest keys, the system SHALL offer a drill: a passage of 100–400 characters built from real words, each containing at least one of those keys. Drills SHALL be timed, scored, and saved like other sessions and SHALL be labeled as drills in the history.

#### Scenario: Starting a drill
- **GIVEN** a user whose weakest keys are "q" and "z"
- **WHEN** they choose "Practice weak keys"
- **THEN** they get a passage in which every word contains "q" or "z"

#### Scenario: Drill unavailable
- **GIVEN** a user with no weakest keys identified yet
- **WHEN** they view the progress page
- **THEN** the "Practice weak keys" option is not offered

### Requirement: Progress is scoped to the current name
The system SHALL show and change only the history of the user matching the current name. Requests with invalid input SHALL be rejected without changing any data.

#### Scenario: Users do not see each other's history
- **GIVEN** users "Grace" and "Alan" each have saved sessions
- **WHEN** Grace views the progress page
- **THEN** only Grace's sessions, trends, and weakest keys are shown

#### Scenario: Malformed save request
- **GIVEN** a save request with missing or out-of-range fields
- **WHEN** the server receives it
- **THEN** it is rejected with a validation error and nothing is stored
