# Feature Specification: Phase 4.5 API Alignment & Refactor

**Feature Branch**: `006-api-alignment-refactor`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User description: "Read BACKEND_PLAN.md the backend file and the new updated frontend file updated_frontend and create a specification for the Phase4.5: API Alighnement & Reafctor"

## Clarifications

### Session 2026-04-30

- Q: Should Phase 4.5 preserve the updated frontend's JSON-server-style resource contract exactly, or may the frontend service layer change to cleaner backend routes? -> A: Preserve the exact resource-style routes and semantics used by `updated_frontend` with no frontend service changes.
- Q: Should resource updates be fully permissive like JSON Server, or should lifecycle actions enforce valid state transitions? -> A: Use hybrid behavior: ordinary partial updates remain mock-compatible, while dedicated transfer/admin action routes enforce valid status transitions and reject impossible changes.
- Q: Should Phase 4.5 require authorization headers for protected resources? -> A: No required authorization headers in Phase 4.5; access remains demo-compatible and role behavior is based on FlowX user records/session context supplied by the frontend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in and load the FlowX workspace (Priority: P1)

A FlowX user or admin opens the updated frontend, signs in with the demo credentials provided by the updated frontend project, and lands in the correct role-specific workspace with their profile, wallet, verification, notification, and transfer data available.

**Why this priority**: The updated frontend cannot be evaluated unless the first screen after login loads from the backend using the resource shapes expected by the new FlowX service layer. This is the compatibility MVP for Phase 4.5.

**Independent Test**: Start the updated frontend against the backend, sign in as the demo user and the demo admin, and confirm both sessions reach their dashboards without mock-server-only assumptions or shape errors.

**Acceptance Scenarios**:

1. **Given** the updated frontend is configured to use the backend as its data source, **When** a demo user submits valid credentials, **Then** the frontend receives a matching user record and stores a current user session with the expected user role, status, country, and trust score.
2. **Given** a newly signed-in user session, **When** the dashboard loads, **Then** the backend returns the user's transfers, wallet rows, verification rows, and notifications in the exact FlowX resource shapes expected by the updated frontend.
3. **Given** an admin signs in with admin demo credentials, **When** the admin dashboard loads, **Then** the backend returns all users, all transfers, all verifications, all disputes, configuration, and audit logs in a single page load without missing-resource errors.
4. **Given** a suspended or non-existent account, **When** the frontend attempts sign-in, **Then** the backend response allows the frontend to reject the session without creating a current user.

---

### User Story 2 - Complete user transfer workflows with FlowX statuses (Priority: P1)

A user creates a transfer using the updated FlowX transfer form, tracks that transfer from the transfer list and status screen, requests a match, submits the transfer, requests payment confirmation, cancels when allowed, or opens a dispute when something goes wrong.

**Why this priority**: Transfers are the core product workflow. Phase 4 implemented an earlier transaction contract; Phase 4.5 must align that behavior with the updated frontend's transfer fields, resource names, routes, and uppercase status values.

**Independent Test**: Create a transfer from the updated frontend, view it in the transfer list, run match/request/submission/payment-confirmation actions, then open a dispute and verify each screen refreshes with the updated transfer or dispute state.

**Acceptance Scenarios**:

1. **Given** a user submits a new transfer with source country, destination country, amount, currency, payment method, receiver name, and receiver payment method, **When** the backend creates the transfer, **Then** the returned transfer contains all FlowX fields including `userId`, `sourceCountry`, `destinationCountry`, `fee`, `netAmount`, `status`, `referenceNumber`, `riskLevel`, `createdAt`, `updatedAt`, and `paymentConfirmationRequested`.
2. **Given** a user has transfers, **When** the frontend requests transfers filtered by `userId`, **Then** only that user's transfer rows are returned as an array.
3. **Given** an admin or workspace page requests all transfers, **When** the backend returns transfer data, **Then** each row uses the updated FlowX transfer status vocabulary and field names.
4. **Given** a transfer is eligible for matching, **When** the frontend requests a match, **Then** the transfer moves to a match-related state that the updated frontend can display.
5. **Given** a transfer is in progress, **When** the user requests payment confirmation, cancels, or opens a dispute, **Then** the backend records the requested state change and returns refreshed resources that keep the frontend in sync.

---

### User Story 3 - Use supporting workspace resources (Priority: P2)

A signed-in user can view wallet balances, verified agents, notifications, and verification status from the updated FlowX workspace without relying on a local JSON mock server.

**Why this priority**: These screens make the FlowX workspace feel complete and are called directly by the updated frontend, but they are secondary to sign-in and transfer creation.

**Independent Test**: Navigate to wallet, marketplace, notifications, and verification screens as a demo user and confirm every page receives the expected resource arrays or objects from the backend.

**Acceptance Scenarios**:

1. **Given** a user opens the wallet page, **When** the frontend requests wallets filtered by `userId`, **Then** the backend returns wallet rows with balance, available balance, escrow balance, and currency.
2. **Given** a user opens the marketplace, **When** the frontend requests agents, **Then** the backend returns verified agent rows with name, region, status, capacity, and verification flag.
3. **Given** a user opens notifications, **When** the frontend requests notifications filtered by `userId`, **Then** the backend returns that user's notifications and supports marking a notification as read.
4. **Given** a user starts or updates verification, **When** the frontend creates or patches a verification row, **Then** the backend returns the updated verification in the FlowX shape.

---

### User Story 4 - Admin review, risk, disputes, and configuration (Priority: P3)

An admin reviews platform activity, approves or rejects verification requests, reviews risky transfers, resolves disputes, refunds transfers, edits configuration, and sees audit history using the updated frontend's admin workspace.

**Why this priority**: Admin pages are necessary for operational completeness, but the user-facing FlowX workflows provide the immediate MVP value.

**Independent Test**: Sign in as the demo admin, open the admin dashboard, process a verification, process a risk review, resolve a dispute, refund a transfer, update configuration, and verify the dashboard data and audit history reflect each action.

**Acceptance Scenarios**:

1. **Given** an admin opens the admin dashboard, **When** the frontend requests users, transfers, verifications, disputes, configuration, and audit logs, **Then** all resources return in FlowX-compatible shapes.
2. **Given** a verification is pending or in review, **When** an admin approves, rejects, or requests more information, **Then** the verification and associated user record update together and an audit log entry is available.
3. **Given** a transfer is under review, **When** an admin approves or rejects risk review, **Then** the transfer leaves the risk queue with a status the frontend can display.
4. **Given** an open dispute, **When** an admin resolves it, **Then** the dispute receives a final status, resolution details, and resolved timestamp.
5. **Given** an admin updates platform configuration, **When** the frontend reloads configuration, **Then** supported countries, supported currencies, corridors, fee percent, exchange rate, and payment window values reflect the update.

---

### Edge Cases

- A frontend collection request includes supported query filters such as `userId`, `email`, `password`, or `status`; the backend must apply exact-match filtering and return an array, even when no rows match.
- A frontend item request references an unknown id; the backend must return a clear not-found response that the frontend can treat as a failed load.
- A create request omits fields that the backend owns, such as ids, timestamps, reference numbers, fees, net amounts, and default statuses; the backend must fill safe defaults while preserving supplied user-entered fields.
- A patch request contains only a subset of fields; the backend must update only provided fields and keep unspecified values unchanged.
- A dedicated transfer or admin action attempts a transition that is not valid for the resource's current state; the backend must reject the change without mutating the resource.
- A generic resource patch updates status or other fields directly; the backend must preserve mock-compatible partial update behavior unless the request is routed through a dedicated lifecycle action.
- The updated frontend still sends mock-server-style calls without custom authorization headers; Phase 4.5 must remain compatible with those calls, deriving demo role behavior from FlowX user records/session context while leaving token-based security to Phase 6.
- Existing Phase 4 routes may remain present for backwards compatibility, but the updated FlowX contract must be the primary contract for this phase.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The backend MUST expose the exact resource-style routes and semantics used by `updated_frontend` for users, transfers, wallets, verifications, disputes, notifications, audit logs, configuration, agents, payment methods, analytics, activities, and requests; Phase 4.5 MUST NOT require frontend service-layer route changes.
- **FR-002**: Collection reads MUST return arrays and MUST support exact-match query filtering for fields used by the updated frontend, including `email`, `password`, `userId`, and `status`.
- **FR-003**: Item reads MUST return a single resource object by id for resources that the updated frontend loads by id, including users and transfers.
- **FR-004**: The backend MUST accept create operations for users, wallets, verifications, notifications, transfers, disputes, and audit logs using the FlowX field names from the updated frontend.
- **FR-005**: The backend MUST accept mock-compatible partial updates for users, wallets, verifications, notifications, transfers, disputes, and configuration while preserving unspecified fields.
- **FR-006**: User sign-in MUST support the updated frontend's credential lookup behavior and MUST prevent suspended or missing users from becoming a valid current user.
- **FR-006a**: Phase 4.5 resource calls MUST NOT require authorization headers; demo role behavior MUST be derived from FlowX user records or frontend-supplied session context so the updated frontend works without service-layer auth changes.
- **FR-007**: User signup MUST create a user and the associated starter wallet, starter verification, and welcome notification expected by the updated frontend.
- **FR-008**: Transfer creation MUST return FlowX transfer fields: `id`, `userId`, `sourceCountry`, `destinationCountry`, `amount`, `currency`, `fee`, `exchangeRate`, `netAmount`, `status`, `paymentMethod`, `receiverName`, `receiverPaymentMethod`, `referenceNumber`, `createdAt`, `updatedAt`, `riskLevel`, and `paymentConfirmationRequested`.
- **FR-009**: Transfer statuses MUST use the updated FlowX vocabulary: `PENDING_REQUEST`, `MATCH_FOUND`, `AWAITING_DEPOSIT`, `DEPOSIT_PENDING`, `DEPOSIT_CONFIRMED`, `BOTH_DEPOSITS_CONFIRMED`, `PROCESSING_PAYOUT`, `COMPLETED`, `UNDER_REVIEW`, `DISPUTED`, `REFUNDED`, `FAILED`, and `CANCELLED`.
- **FR-010**: Dedicated transfer and admin action routes MUST enforce valid lifecycle transitions for submit, match request, payment confirmation request, cancellation, refund, risk approval, and risk rejection, returning a failure without mutation when an impossible transition is requested.
- **FR-011**: Dispute workflows MUST support opening disputes from a transfer and resolving disputes with status, resolution text, and resolved timestamp.
- **FR-012**: Verification workflows MUST support creating verification rows and admin updates for approval, rejection, and needs-more-information outcomes.
- **FR-013**: Admin actions that change verifications, disputes, transfers, or configuration MUST produce audit log data with actor id, actor role, action, entity type, entity id, and timestamp.
- **FR-014**: Configuration reads and updates MUST preserve `feePercent`, `exchangeRate`, `supportedCountries`, `supportedCurrencies`, `supportedCorridors`, and `paymentWindowMinutes`.
- **FR-015**: Wallet reads and updates MUST preserve `balance`, `escrowBalance`, `availableBalance`, and `currency` by user.
- **FR-016**: Notification reads and updates MUST support user-filtered inboxes and marking notifications as read.
- **FR-017**: Agent, payment-method, analytics, activity, and request resources MUST return stable shapes sufficient for the updated frontend pages to render without mock-server-specific failures.
- **FR-018**: The backend MUST keep Phase 4 auth endpoints and transaction endpoints from breaking existing consumers, while making the updated FlowX resource contract the primary contract for Phase 4.5.
- **FR-019**: Error responses MUST be predictable enough for the updated frontend service layer to surface failed loads and failed actions without crashing.
- **FR-020**: Phase 4.5 MUST NOT introduce durable persistence requirements; persistence changes remain Phase 5 scope.

### Key Entities *(include if feature involves data)*

- **FlowX User**: A user or admin account with profile, role, account type, country, phone, verification status, trust score, account status, and created timestamp.
- **FlowX Transfer**: A money-transfer workflow record owned by a user, with source/destination countries, amount, currency, fee, rate, net amount, status, payment details, receiver details, reference number, timestamps, risk level, and payment-confirmation flag.
- **Wallet**: A balance record tied to a user, including total, escrow, available balance, and currency.
- **Verification**: A KYC or business-verification record tied to a user, with status, level, document type, submission/review timestamps, reviewer, and rejection or information-request reason.
- **Dispute**: A transfer dispute with transfer owner, reason, evidence, status, resolution, created timestamp, and resolved timestamp.
- **Notification**: A user-facing message with title, message, read flag, type, and created timestamp.
- **Configuration**: Platform settings for fees, exchange rate, supported countries, supported currencies, supported corridors, and payout timing.
- **Audit Log**: An admin or system activity record with actor, role, action, entity type, entity id, and timestamp.
- **Agent**: A marketplace participant with display name, region, availability status, capacity, and verification flag.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The updated frontend can complete demo user login and demo admin login against the backend with 0 mock-server dependency warnings.
- **SC-002**: 100% of updated frontend service calls used during the user dashboard, transfer list, transfer status, wallet, marketplace, notifications, verification, admin dashboard, users, requests, disputes, and analytics pages return a compatible response shape.
- **SC-003**: A reviewer can create a transfer, request a match, submit it, request payment confirmation, and open a dispute from the updated frontend in under 3 minutes.
- **SC-004**: A reviewer can approve or reject a verification, resolve a dispute, refund a transfer, and update configuration from the admin workspace without manually editing mock data.
- **SC-005**: All collection filters used by the frontend return correct array results for at least the seeded demo user, demo admin, and one additional non-admin user.
- **SC-006**: 0 updated frontend screens crash or render a permanent loading state because of missing backend resources or mismatched field names.
- **SC-007**: Every admin state-changing action leaves a visible audit log entry within the next admin dashboard refresh.
- **SC-008**: No Phase 5 durable-storage behavior is required to demonstrate Phase 4.5; a fresh backend can still seed or serve the FlowX demo dataset.

## Assumptions

- The updated frontend directory `updated_frontend/` is the source of truth for Phase 4.5 contract alignment.
- The FlowX mock dataset in `updated_frontend/db.json` represents the minimum demo seed data and expected response shapes for this phase.
- The updated frontend currently uses resource-style calls and simple query filters; Phase 4.5 preserves those exact route names and semantics over the older Phase 4 transaction route names.
- Authentication remains compatibility-oriented and header-free in Phase 4.5. Full token issuance, credential hardening, authorization headers, and long-term authorization policy remain Phase 6 scope.
- Data persistence remains out of scope. Phase 4.5 may use temporary, seeded, or in-memory/demo data as long as the updated frontend contract is satisfied.
- Existing Phase 4 behavior should not be removed unless it directly conflicts with the updated FlowX contract.
