# Spec Delta

## Purpose

Lets a person identify themselves with a display name, without creating an account, so their practice sessions and progress can be kept together and shown back to them.

## ADDED Requirements

### Requirement: Display name entry
The system SHALL require a display name before a user can start practicing. The name SHALL be trimmed of leading and trailing whitespace, have runs of internal whitespace collapsed to a single space, and then be between 2 and 30 characters long. Allowed characters are letters (any language), digits, spaces, hyphens, underscores, apostrophes, and periods.

#### Scenario: Valid name is accepted
- **GIVEN** a first-time visitor on the name entry screen
- **WHEN** they enter "  Ada   Lovelace " and submit
- **THEN** the system accepts the name as "Ada Lovelace"
- **AND** takes them to the practice screen

#### Scenario: Empty or whitespace-only name is rejected
- **GIVEN** the name entry screen
- **WHEN** the user submits an empty name or one made only of spaces
- **THEN** the system does not proceed
- **AND** shows the error "Please enter a name (2–30 characters)"

#### Scenario: Name too long is rejected
- **GIVEN** the name entry screen
- **WHEN** the user submits a name that is 31 or more characters after trimming
- **THEN** the system does not proceed
- **AND** shows an error stating the 30-character limit

#### Scenario: Name with disallowed characters is rejected
- **GIVEN** the name entry screen
- **WHEN** the user submits "<script>" or a name containing emoji
- **THEN** the system does not proceed
- **AND** shows an error listing the allowed characters

#### Scenario: Name is validated on the server as well
- **GIVEN** a request that bypasses the name entry screen
- **WHEN** it submits a name that breaks any rule above
- **THEN** the system rejects the request and stores nothing

### Requirement: Names identify users case-insensitively
The system SHALL treat names that differ only in letter case as the same user, and SHALL display the name with the casing it was first created with.

#### Scenario: Returning user types a different case
- **GIVEN** a user "Ada Lovelace" with saved sessions
- **WHEN** someone enters "ada lovelace"
- **THEN** the system links them to the existing user
- **AND** greets them as "Ada Lovelace" and shows that user's history

#### Scenario: New name creates a new user
- **GIVEN** no user named "Grace"
- **WHEN** someone enters "Grace"
- **THEN** the system creates a new user named "Grace" with no history

### Requirement: Remembered name on return visits
The system SHALL remember the last accepted name on the same browser and skip name entry on later visits until the user changes it or clears browser data.

#### Scenario: Returning visitor skips name entry
- **GIVEN** a user who entered "Grace" earlier on this browser
- **WHEN** they open the app again
- **THEN** the system greets them as "Grace" and lets them start practicing without entering a name

#### Scenario: Remembered name is cleared
- **GIVEN** a visitor whose browser no longer has the remembered name
- **WHEN** they open the app
- **THEN** the system shows the name entry screen

### Requirement: Change name
The system SHALL let the current user switch to a different name at any time outside an active typing session.

#### Scenario: User switches name
- **GIVEN** a user practicing as "Grace"
- **WHEN** they choose "Not you? Change name" and enter "Alan"
- **THEN** the system switches to user "Alan"
- **AND** the progress shown is Alan's, not Grace's

### Requirement: Accessible name entry
The name entry screen SHALL be fully usable with the keyboard alone, SHALL give the input a visible label that screen readers also announce, SHALL announce validation errors to assistive technology, and SHALL meet WCAG 2.1 AA contrast.

#### Scenario: Keyboard-only submission
- **GIVEN** the name entry screen has just loaded
- **WHEN** the user types a valid name and presses Enter
- **THEN** the name is submitted without using a pointer
- **AND** the input had keyboard focus when the page loaded

#### Scenario: Error is announced
- **GIVEN** a screen reader user on the name entry screen
- **WHEN** they submit an invalid name
- **THEN** the error message is announced
- **AND** focus stays on the name input, which is marked as invalid
