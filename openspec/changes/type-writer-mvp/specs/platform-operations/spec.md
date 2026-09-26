# Spec Delta

## Purpose

Defines the operational behavior the hosting platform relies on to run Type Writer reliably: health reporting, configuration, statelessness, graceful shutdown, and safe handling of secrets.

## ADDED Requirements

### Requirement: Liveness check
The service SHALL expose `GET /api/health`, which returns HTTP 200 whenever the process can serve requests, whether or not dependencies are available. The response SHALL contain only a status indicator and SHALL NOT reveal versions, hostnames, configuration, or error details.

#### Scenario: Process is running
- **GIVEN** a running instance
- **WHEN** `GET /api/health` is called
- **THEN** it responds with HTTP 200 and `{"status":"ok"}`

#### Scenario: Database is down
- **GIVEN** a running instance whose database is unreachable
- **WHEN** `GET /api/health` is called
- **THEN** it still responds with HTTP 200, so the instance is not restarted over a dependency outage

### Requirement: Readiness check
The service SHALL expose `GET /api/health/ready`, which returns HTTP 200 only when the instance can reach its database, and HTTP 503 otherwise. It SHALL respond within 2 seconds in either case.

#### Scenario: Ready
- **GIVEN** an instance connected to its database
- **WHEN** `GET /api/health/ready` is called
- **THEN** it responds with HTTP 200

#### Scenario: Not ready
- **GIVEN** an instance that cannot reach its database
- **WHEN** `GET /api/health/ready` is called
- **THEN** it responds with HTTP 503 within 2 seconds
- **AND** the response does not include connection strings or error details

### Requirement: Configuration from the environment
All environment-specific settings, including database location and credentials, SHALL come from the runtime environment and SHALL NOT be built into the deployable artifact. If a required setting is missing, the service SHALL refuse to start and SHALL log which setting is missing without logging any value.

#### Scenario: Missing database setting
- **GIVEN** the database connection setting is not provided
- **WHEN** the service starts
- **THEN** it exits with a non-zero status
- **AND** logs an error naming the missing setting

#### Scenario: Same artifact in every environment
- **GIVEN** one built artifact
- **WHEN** it is deployed to staging and to production with different environment settings
- **THEN** each deployment connects to its own database without being rebuilt

### Requirement: Stateless instances
Any instance SHALL be able to serve any request. The service SHALL NOT keep user or session state in instance memory that another instance would need.

#### Scenario: Instance replaced mid-session
- **GIVEN** a user halfway through a typing session
- **WHEN** the instance that served their page is replaced
- **THEN** the user can still finish the session and have it saved by another instance

### Requirement: Graceful shutdown
When told to stop, an instance SHALL stop accepting new requests, report itself not ready, and finish in-flight requests for up to 25 seconds before exiting.

#### Scenario: Rolling deployment
- **GIVEN** a user saving a session while an instance is being replaced
- **WHEN** the instance receives a termination signal
- **THEN** the in-flight save completes successfully before the instance exits

### Requirement: Secret-safe logging
The service SHALL write logs to standard output as structured, one-line entries. Logs SHALL NOT contain secrets, credentials, or full connection strings.

#### Scenario: Database error is logged
- **GIVEN** the database rejects a connection
- **WHEN** the error is logged
- **THEN** the log entry contains an error category and message
- **AND** does not contain the database password or connection string
