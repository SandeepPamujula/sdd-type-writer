# web-platform Specification

## Purpose

Defines the delivery and quality constraints of the typing tutor: a static, backend-free site that works
offline, on small screens, and in light or dark mode.

## Requirements

### Requirement: No backend
The site SHALL consist only of static files (HTML, CSS, JavaScript) and SHALL make no network requests after the initial load. It SHALL NOT load any library, font or asset from a third-party origin or CDN. All persisted data SHALL stay in the user's browser.

#### Scenario: Offline after load
- **WHEN** the site has loaded and the network connection is then lost
- **THEN** every feature keeps working

#### Scenario: No data leaves the browser
- **WHEN** a user completes a session
- **THEN** no network request is made

### Requirement: Static delivery
The site SHALL be deployable as a folder of static files to any static host, including under a sub-path, with no server-side code. It SHALL work in the current versions of Chrome, Edge, Firefox and Safari.

#### Scenario: Served from a static host
- **WHEN** the built files are served by a plain static file server
- **THEN** the name entry screen appears and works

#### Scenario: Served under a sub-path
- **WHEN** the site is served under a sub-path such as `/sdd-type-writer/`
- **THEN** all pages and assets load and the site works

### Requirement: Responsive layout
The site SHALL be usable at viewport widths from 360 px upward without horizontal scrolling. Typing with a physical keyboard SHALL be supported at every width; typing with an on-screen touch keyboard is best-effort.

#### Scenario: Phone width
- **WHEN** the site is viewed at 375 px wide
- **THEN** all screens fit the width with no horizontal scrollbar and the passage remains three lines tall

### Requirement: Light and dark themes
The site SHALL follow the operating system's colour-scheme preference, with correct, incorrect and pending characters distinguishable in both themes. Incorrect characters SHALL be distinguishable by more than colour alone.

#### Scenario: Dark mode
- **WHEN** the operating system prefers a dark colour scheme
- **THEN** the site renders with dark backgrounds and legible text and feedback colours

#### Scenario: Incorrect without relying on colour
- **WHEN** a character (including a space) is typed incorrectly
- **THEN** it is marked with a highlighted background or underline in addition to its colour
