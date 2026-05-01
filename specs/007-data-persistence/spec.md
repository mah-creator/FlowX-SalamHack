# Feature Specification: Phase 5 Data Persistence

**Feature Branch**: `007-data-persistence`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User description: "Read BACKEND_PLAN.md and create a specification for the Phase5: Data Persistence"

## Clarifications

### Session 2026-04-30

- Q: Which persistence target should Phase 5 use? -> A: SQLite for local/demo persistence
- Q: How should baseline demo data be initialized after persistence is introduced? -> A: Seed once; explicit reset only
- Q: Which persisted transfer representation should be canonical when FlowX and legacy Phase 4 behavior overlap? -> A: FlowX canonical; legacy adapts
- Q: Should Phase 5 migrate temporary runtime data from Phase 4.5? -> A: No migration; seed baseline

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preserve FlowX data across restarts (Priority: P1)

A demo user or admin can create and update FlowX records, stop and restart the backend, and continue from the same data state without returning to the temporary seeded dataset.

**Why this priority**: Phase 5 replaces temporary data handling. The product cannot support realistic demos, review sessions, or continued workflows unless user-created data survives normal backend restarts.

**Independent Test**: Create a user, wallet, transfer, verification, notification, dispute, configuration update, and audit log through the existing FlowX contract, restart the backend, then reload the updated frontend and confirm the same records and values are still present.

**Acceptance Scenarios**:

1. **Given** the backend starts with an initialized FlowX dataset, **When** a user creates a transfer and the backend restarts, **Then** the transfer remains available with the same identifier, status, amounts, timestamps, and relationship to the user.
2. **Given** an admin updates verification, dispute, transfer, or configuration data, **When** the backend restarts, **Then** the updated values and corresponding audit history remain visible from the admin workspace.
3. **Given** an existing Phase 4.5 frontend data request, **When** the same request is made after persistence is enabled, **Then** the response shape, filtering behavior, and status handling remain compatible with the updated frontend.

---

### User Story 2 - Initialize predictable demo data (Priority: P1)

A developer or reviewer can set up a clean persistent backend state that contains the minimum FlowX demo users, wallets, transfers, verifications, disputes, notifications, configuration, audit logs, agents, payment methods, analytics, activities, and requests required by the updated frontend.

**Why this priority**: Persistent storage must still support fast local setup and repeatable contract tests. The updated frontend should continue to run without manual data entry after setup.

**Independent Test**: Start from an empty persistent environment, run the documented initialization process, open the updated frontend, and confirm user and admin demo workflows load with the expected baseline records.

**Acceptance Scenarios**:

1. **Given** no existing persistent FlowX data, **When** the setup process is run, **Then** baseline demo records are created once with stable relationships across users, wallets, transfers, verifications, notifications, configuration, and audit logs.
2. **Given** baseline demo data already exists, **When** the setup process is run again, **Then** it does not overwrite user-created data or create duplicate users, wallets, configuration, or read-mostly reference records.
3. **Given** the updated frontend logs in as the demo user or demo admin, **When** dashboard resources load, **Then** all required screens receive compatible baseline data without relying on temporary in-memory state.

---

### User Story 3 - Maintain data integrity during workflows (Priority: P2)

Users and admins can complete transfer, verification, dispute, wallet, notification, and configuration workflows while related records remain consistent and recoverable.

**Why this priority**: Persistence adds long-lived data. Incorrect relationships or partial updates can leave workflows stuck after refresh, restart, or later admin review.

**Independent Test**: Complete a transfer workflow, open a dispute, resolve it as admin, update related user verification and wallet data, then verify all related records remain consistent across page refreshes and backend restarts.

**Acceptance Scenarios**:

1. **Given** a transfer references a user, **When** the transfer is created or updated, **Then** it remains associated with an existing user and can be retrieved by user-filtered transfer requests.
2. **Given** a dispute is opened for a transfer, **When** the dispute is persisted, **Then** the dispute remains associated with the transfer and user and the transfer reflects a dispute-compatible state.
3. **Given** an admin performs a state-changing action, **When** the action succeeds, **Then** the changed resource and audit log are both durably recorded as one completed outcome from the user's perspective.
4. **Given** a write request is invalid, incomplete, or targets a missing related record, **When** the backend rejects it, **Then** no partial or orphaned persistent data is created.

---

### User Story 4 - Keep legacy Phase 4 consumers working (Priority: P3)

Existing Phase 4 authentication and transaction behavior continues to work while the updated FlowX resource contract gains durable persistence.

**Why this priority**: Phase 4.5 explicitly preserved backwards compatibility. Phase 5 must not trade persistence for regressions in existing consumers.

**Independent Test**: Run existing Phase 4 and Phase 4.5 compatibility tests against persistent storage and confirm both behavior groups still pass.

**Acceptance Scenarios**:

1. **Given** an existing Phase 4 consumer uses transaction or auth behavior, **When** persistence is enabled, **Then** those interactions continue to return compatible responses and state changes.
2. **Given** FlowX resource behavior and Phase 4 behavior operate in the same backend, **When** both are used in one test run, **Then** FlowX transfer data remains canonical and legacy Phase 4 behavior adapts to it without conflicting or corrupting state.

### Edge Cases

- A persistent environment is empty on first startup; the system must provide a documented initialization path before frontend workflows are evaluated.
- Initialization is run more than once; baseline records must remain stable and must not be duplicated.
- A write succeeds immediately before a restart; the successful change must be visible after restart.
- A write request fails validation or references a missing user, transfer, wallet, verification, dispute, notification, or configuration record; no partial persistent state should remain.
- A collection filter matches no persisted records; the response must remain an empty array.
- Existing temporary demo data differs from persisted data; Phase 5 does not migrate temporary runtime data, and persisted baseline data is authoritative after initialization.
- Read-mostly resources such as agents, payment methods, analytics, activities, and requests may be reset to baseline only through an explicit setup/reset action.
- A developer explicitly requests a demo reset; baseline records may be restored, and user-created local data may be cleared as part of that intentional reset.
- Existing Phase 4 behavior and updated FlowX resource behavior may reference overlapping transfer concepts; FlowX transfer records are canonical where concepts overlap.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST persist FlowX users, transfers, wallets, verifications, disputes, notifications, configuration, audit logs, agents, payment methods, analytics, activities, and requests beyond a single backend run.
- **FR-002**: The system MUST preserve the Phase 4.5 FlowX data contract exactly from the updated frontend's perspective, including resource names, request fields, response fields, filtering behavior, status vocabulary, and error expectations.
- **FR-003**: The system MUST provide an initialization process that creates the minimum baseline FlowX demo dataset required for user and admin frontend workflows.
- **FR-004**: The initialization process MUST be repeatable without duplicating baseline users, wallets, configuration, or read-mostly reference records.
- **FR-005**: The system MUST preserve existing record identifiers across restarts so frontend links, detail pages, and related resources continue to resolve.
- **FR-006**: The system MUST maintain relationships between users and their wallets, transfers, verifications, disputes, notifications, and audit events.
- **FR-007**: The system MUST maintain transfer lifecycle state and payment-confirmation fields across refreshes and backend restarts.
- **FR-008**: The system MUST maintain admin updates to verifications, disputes, transfers, and configuration across refreshes and backend restarts.
- **FR-009**: The system MUST durably record audit log entries for successful admin state-changing actions.
- **FR-010**: The system MUST ensure successful multi-record actions are visible as a complete outcome; if any required part fails, the user-visible action must not leave partial related records.
- **FR-011**: The system MUST reject writes that reference missing required related records and MUST avoid creating orphaned persistent records.
- **FR-012**: The system MUST continue returning arrays for collection reads, including empty arrays for unmatched filters.
- **FR-013**: The system MUST continue supporting mock-compatible partial updates for the resource families supported in Phase 4.5 while preserving unspecified fields.
- **FR-014**: The system MUST support resetting local demo data to the documented baseline for repeatable demos and contract testing.
- **FR-015**: The system MUST keep existing Phase 4 authentication and transaction behavior from regressing while FlowX resource persistence is enabled.
- **FR-016**: The system MUST provide clear setup and verification instructions so a developer can initialize, run, restart, and validate persistent data behavior locally.
- **FR-017**: Phase 5 MUST use SQLite as the persistent storage target for local demo and contract-test workflows.
- **FR-018**: Baseline demo data MUST be seeded only when missing; existing persisted data MUST NOT be overwritten unless a developer explicitly runs a reset workflow.
- **FR-019**: FlowX transfer records MUST be the canonical persisted representation for transfer-like data; legacy Phase 4 transaction behavior MUST adapt to the canonical FlowX record where concepts overlap.
- **FR-020**: Phase 5 MUST NOT require migration of temporary Phase 4.5 runtime data; persistent environments MUST start from the documented baseline unless data is created through persistent workflows after initialization.

### Key Entities *(include if feature involves data)*

- **FlowX User**: A durable user or admin account with profile, role, verification status, trust score, account status, and relationships to user-owned resources.
- **FlowX Transfer**: The canonical durable money-transfer workflow with owner, countries, amount, currency, fee, exchange rate, net amount, status, payment details, receiver details, reference number, risk level, payment-confirmation flag, timestamps, and any compatibility mapping needed for legacy Phase 4 transaction behavior.
- **Wallet**: A durable balance record tied to a user, including balance, available balance, escrow balance, and currency.
- **Verification**: A durable identity or business verification record tied to a user, including status, level, document details, review data, and rejection or information-request reason.
- **Dispute**: A durable transfer dispute with transfer, user, reason, evidence, status, resolution, and timestamps.
- **Notification**: A durable user message with title, message, read state, type, and timestamp.
- **Configuration**: Durable platform settings for fees, exchange rates, supported countries, supported currencies, supported corridors, and payment-window timing.
- **Audit Log**: A durable activity record for admin or system changes, including actor, role, action, entity type, entity id, and timestamp.
- **Reference Resource**: Durable or resettable support data used by the workspace, including agents, payment methods, analytics, activities, and requests.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Phase 4.5 FlowX compatibility tests pass before and after a backend restart using persisted data.
- **SC-002**: A reviewer can initialize an empty local environment and reach both demo user and demo admin dashboards in under 5 minutes.
- **SC-003**: A transfer created from the updated frontend remains visible with the same identifier and status after at least 3 backend restarts.
- **SC-004**: 100% of successful admin actions that change verifications, disputes, transfers, or configuration produce a visible audit log entry after refresh and restart.
- **SC-005**: Re-running baseline data initialization 3 consecutive times produces no duplicate baseline users, wallets, configuration records, agents, or payment methods and does not remove user-created records.
- **SC-006**: Existing Phase 4 compatibility tests and Phase 4.5 FlowX compatibility tests both pass in the same persistent test run.
- **SC-007**: Failed writes that reference missing required related records leave 0 orphaned records in subsequent collection reads.
- **SC-008**: No updated frontend screen enters a permanent loading or crash state because persisted records have missing required fields or broken relationships.

## Assumptions

- Phase 4.5 alignment is the source of truth for resource names, field names, status values, and frontend-visible behavior.
- Phase 5 changes the lifetime and integrity of backend data, not the updated frontend service layer.
- Full authentication and authorization hardening remain Phase 6 scope; Phase 5 preserves the existing demo-compatible access behavior unless required for data integrity.
- Baseline demo data should be derived from the FlowX dataset and resource shapes already used by the updated frontend and Phase 4.5 specification.
- Local development and contract testing need a repeatable way to initialize or reset demo data.
- Production deployment, monitoring, containerization, and readiness checks remain Phase 7 scope unless a minimal local setup step is required to verify persistence.
- SQLite is the Phase 5 persistence target; broader production database selection remains outside this phase unless explicitly revisited in a later phase.
- Baseline demo data is seeded once when missing; resetting to baseline is an explicit developer action, not automatic startup behavior.
- FlowX transfers are the canonical persisted transfer records; legacy Phase 4 transaction behavior maps to them when the same business concept is involved.
- Temporary Phase 4.5 runtime data is disposable for Phase 5; no import or migration is required before enabling persistent storage.
