# Feature Specification: Core API Implementation (Phase 4)

**Feature Branch**: `005-core-api-implementation`
**Created**: 2026-04-30
**Status**: Draft
**Input**: User description: "Read BACKEND_PLAN.md and create a specification for the Phase4: Core API Implementation"

## User Scenarios & Testing *(mandatory)*

<!--
  Phase 4's mandate from BACKEND_PLAN.md is "implement the primary
  endpoints required for core frontend functionality" and "focus on
  main user journeys". The Phase 1 audit
  (specs/002-api-discovery/api-contract.md) catalogues 18 endpoints
  (EP-001..EP-018). This spec turns the Phase 2 stubs into working
  responses for the user-journey endpoints (EP-001..EP-010) and the
  admin-journey endpoints (EP-011..EP-014). The auth endpoints
  (EP-015..EP-018) are deferred to Phase 6 per Phase 1's CR-002.
-->

### User Story 1 - Send money: initiate transfer and find a counterparty match (Priority: P1)

A sender opens the app, submits a transfer request specifying an amount and currency, and watches the system pair them with a matching counterparty so the cross-border swap can begin. The sender returns to their dashboard at any time and sees their in-flight transfer with the correct status.

**Why this priority**: This is the primary entry point of the product. Without a working create-transfer + auto-match + dashboard read, no other user journey is reachable. The frontend's `NewTransferPage`, `DashboardPage`, and `MatchFoundPage` cannot operate against the Phase 2 stubs.

**Independent Test**: Against a freshly started backend with no prior transactions, a reviewer (a) lists their transactions and gets an empty collection, (b) submits a valid create-transfer payload and receives a server-issued transaction record in `Pending Request` state, (c) requests an auto-match for that transaction and receives the same transaction in `Match Found` state, and (d) refetches the transaction by id and sees the same `Match Found` state.

**Acceptance Scenarios**:

1. **Given** the sender has an authenticated session, **When** they request the dashboard transaction list, **Then** the response returns the documented transactions collection shape with the user's transactions only.
2. **Given** the sender submits a valid amount and currency, **When** the server creates the transfer, **Then** the response is a transaction with a server-issued id, `status: "Pending Request"`, the configured `feePercent` and `exchangeRate` from the platform configuration, a derived `receivableAmount`, an empty `auditLog`, and `depositA`/`depositB` set to `false`.
3. **Given** the sender invokes auto-match against a freshly created `Pending Request` transaction, **When** the server processes the request, **Then** the transaction transitions to `Match Found` and an audit-log entry recording the match is appended.
4. **Given** the sender supplies a transaction id (their own) on a single-transaction read, **When** the server resolves the transaction, **Then** the response carries the full transaction shape including current status, deposit flags, and audit log.
5. **Given** the sender supplies an unknown transaction id, **When** the server attempts to resolve it, **Then** the server returns a not-found error in the canonical envelope with a stable `error.code`.
6. **Given** the sender attempts an action against another user's transaction id, **When** the server processes the request, **Then** the server returns a forbidden error in the canonical envelope.

---

### User Story 2 - Complete the deposit-and-payout cycle (Priority: P1)

After a sender accepts a match, both parties confirm their deposits and the system releases funds, moving the transaction through `Awaiting Deposits` → `Both Deposits Confirmed` → `Processing Payouts` → `Completed`. The sender can refresh the transaction status at each step and observe the correct state.

**Why this priority**: This completes the happy-path user journey end-to-end. Without it, the product cannot demonstrate value: matched transfers cannot be settled. P1 because Story 1 alone is unfinished without Story 2; together they constitute the demo MVP.

**Independent Test**: Starting from a `Match Found` transaction (precondition supplied by Story 1), a reviewer (a) confirms the match and observes `Awaiting Deposits`, (b) confirms party A's deposit and observes `Deposit Confirmed Partially` with `depositA: true`, (c) confirms party B's deposit and observes `Both Deposits Confirmed`, (d) requests payout processing and observes the transaction reach `Completed` (immediately or after a server-side settlement window — see Assumptions), (e) refetches the transaction and verifies the audit log lists every transition with `time`, `actor`, and `action`.

**Acceptance Scenarios**:

1. **Given** a transaction is in `Match Found`, **When** confirm-match is invoked, **Then** the transaction transitions to `Awaiting Deposits` and the audit log records the transition.
2. **Given** a transaction is in `Awaiting Deposits` with both deposit flags `false`, **When** the sender confirms party A's deposit, **Then** `depositA` becomes `true`, status moves to `Deposit Confirmed Partially`, and the audit log records the deposit.
3. **Given** the prior state has `depositA: true` and `depositB: false`, **When** party B's deposit is confirmed, **Then** `depositB` becomes `true` and the status moves to `Both Deposits Confirmed`.
4. **Given** a transaction in `Both Deposits Confirmed`, **When** process-payouts is invoked, **Then** the response shape is the canonical transaction with status `Processing Payouts` (which the server will transition to `Completed` within the documented settlement window) and an audit-log entry recording the payout decision.
5. **Given** a transaction has reached `Completed`, **When** the sender refetches it, **Then** the audit log contains entries for every preceding transition in chronological order.
6. **Given** a transaction is in any state other than the documented predecessor for the requested action, **When** the action is invoked, **Then** the server returns an invalid-state error in the canonical envelope and does not mutate the transaction.
7. **Given** a deposit-confirmation request omits or supplies an invalid `party` field, **When** the server validates the request, **Then** the server returns a validation error in the canonical envelope.

---

### User Story 3 - Back out or escalate a problem transfer (Priority: P2)

A sender who has not yet exchanged deposits can cancel a transaction. A sender whose transaction has gone wrong can open a dispute with a reason. In either case the transaction transitions to a documented terminal or escalated state and is visible to the dashboard read endpoints.

**Why this priority**: Cancel/dispute pathways are necessary for any real flow (frontend pages `AwaitingDepositPage` and `DisputePage` rely on them) but are not on the happy path. P2 because the product can demo without them once Stories 1 and 2 work, but cannot be released without them.

**Independent Test**: Starting from a `Pending Request` transaction, a reviewer cancels it and observes `Failed`. Starting from any active state, a reviewer opens a dispute with a reason and observes `Disputed` with `disputeReason` populated.

**Acceptance Scenarios**:

1. **Given** a transaction is in `Pending Request` or `Match Found`, **When** the sender cancels it, **Then** the status moves to `Failed` and the audit log records the cancellation.
2. **Given** a transaction is in `Completed`, `Failed`, or `Refunded`, **When** the sender attempts to cancel it, **Then** the server returns an invalid-state error in the canonical envelope and does not mutate the transaction.
3. **Given** a transaction is in any active state, **When** the sender opens a dispute with a non-empty reason, **Then** the status moves to `Disputed`, `disputeReason` is stored, and the audit log records the dispute.
4. **Given** the sender opens a dispute with a missing or empty reason, **When** the server validates the request, **Then** the server returns a validation error in the canonical envelope.

---

### User Story 4 - Admin review and resolution (Priority: P3)

An operator with admin privileges lists transactions across all users (optionally filtered by status), flags suspicious transactions for review, approves transactions awaiting review, refunds transactions, and resolves disputed transactions to either `Completed` or `Refunded`.

**Why this priority**: The frontend's `AdminDashboardPage` exists and the Phase 1 contract documents EP-009 and EP-011..EP-014, but admin behavior is not on the demo's primary user journey. P3 because Stories 1–3 deliver the core consumer demo; admin oversight extends the product but is not a release blocker for the consumer flow.

**Independent Test**: A reviewer authenticated with an admin-style token (a) lists all transactions, (b) optionally filters by status, (c) flags a transaction so it reaches `Under Review`, (d) approves it back to `Both Deposits Confirmed`, (e) refunds an active transaction so it reaches `Refunded`, and (f) resolves a `Disputed` transaction to either `Completed` or `Refunded` per the request payload.

**Acceptance Scenarios**:

1. **Given** an admin requests the admin transaction list, **When** the server responds, **Then** the response is a transactions collection containing transactions across users in the documented shape.
2. **Given** an admin supplies an optional status query parameter, **When** the server responds, **Then** the result is filtered to transactions whose status matches the requested value.
3. **Given** a transaction is in any active state, **When** the admin flags it for risk, **Then** the status moves to `Under Review` and the audit log records the flag.
4. **Given** a transaction is in `Under Review`, **When** the admin approves it, **Then** the status moves to `Both Deposits Confirmed` and the audit log records the approval.
5. **Given** a transaction is in any active state, **When** the admin refunds it, **Then** the status moves to `Refunded` and the audit log records the refund.
6. **Given** a transaction is in `Disputed`, **When** the admin resolves the dispute with outcome `Completed`, **Then** the status moves to `Completed`; **When** the outcome is `Refunded`, **Then** the status moves to `Refunded`.
7. **Given** a non-admin caller invokes any admin endpoint, **When** the server processes the request, **Then** the server returns the canonical forbidden error.

---

### Edge Cases

- A caller invokes auto-match on a transaction not in `Pending Request` (e.g., already `Match Found` or `Failed`); the server must reject with the documented invalid-state error and not mutate the transaction.
- A caller confirms the same deposit party twice; the server must treat the second call as either a no-op success or an invalid-state error consistently across the codebase, not silently flip the flag back, and the contract test must encode the chosen behavior.
- A caller invokes process-payouts before both deposits are confirmed; the server returns the invalid-state error.
- A caller mutates a transaction while a server-side payout settlement is in progress (e.g., requests cancel during `Processing Payouts`); the server must reject with the invalid-state error.
- A caller reads a transaction that belongs to a different non-admin user; the server returns the forbidden error rather than the not-found error so ownership is signalled clearly to the frontend.
- A caller sends a JSON body with extra unknown fields; the server must accept the request (extra fields are ignored) and not return a validation error, since the frontend may evolve.
- A caller submits a transfer-create payload with a non-positive amount or an unsupported currency value; the server returns a validation error in the canonical envelope.
- A request payload is malformed JSON or has the wrong content type; the server returns the canonical validation/error envelope rather than the framework's default.
- The server restarts mid-session; in Phase 4 the in-memory store may be reset (per BACKEND_PLAN.md "may use temporary or in-memory data storage"). The contract observable to the frontend MUST NOT change; only the data persistence surface changes (Phase 5 introduces durable storage).
- The Phase 1 contract is amended between this phase and a later one; the implementation MUST be updated to match — the test or contract MUST NOT be edited to match a drifted implementation (constitution Principle I).

## Requirements *(mandatory)*

### Functional Requirements

#### Endpoint scope and contract fidelity

- **FR-001**: The implementation MUST replace the Phase 2 stub responses with working responses for the user-journey endpoints `EP-001`, `EP-002`, `EP-003`, `EP-004`, `EP-005`, `EP-006`, `EP-007`, `EP-008`, and `EP-010` as documented in `specs/002-api-discovery/api-contract.md`.
- **FR-002**: The implementation MUST replace the Phase 2 stub responses with working responses for the admin-journey endpoints `EP-009`, `EP-011`, `EP-012`, `EP-013`, and `EP-014` as documented in `specs/002-api-discovery/api-contract.md`.
- **FR-003**: The implementation MUST leave `EP-015`, `EP-016`, `EP-017`, and `EP-018` (auth endpoints) as Phase 2 stubs because Phase 1's `CR-002` records `phase_6` as the owner of those endpoints; Phase 4 MUST NOT prematurely implement them.
- **FR-004**: All endpoint paths, HTTP methods, request headers, request bodies, response shapes, and status codes MUST exactly match the Phase 1 contract verbatim — no path prefixes, no renamed fields, no added required fields beyond those documented.
- **FR-005**: The implementation MUST preserve the canonical error envelope (`{ "error": { "code": ..., "message": ..., "details": ... } }`) for every non-2xx response across every endpoint covered by FR-001 and FR-002.
- **FR-006**: The implementation MUST honor the constitution's Phase 2 dispensation for derived endpoints; the working responses MUST satisfy the de-facto contract documented in Phase 1 until the frontend is wired or the constitution is amended.

#### State machine correctness

- **FR-007**: Transaction creation (`EP-003`) MUST issue a server-issued id (per Phase 2's `CR-003` resolution), set `status` to `Pending Request`, set `depositA` and `depositB` to `false`, set `feePercent` and `exchangeRate` from the platform configuration, compute `receivableAmount` from amount/fee/rate, set `createdAt` to a server timestamp, and append a creation entry to the audit log. Client-supplied `id` fields in the request body MUST be ignored.
- **FR-008**: Auto-match (`EP-010`) MUST transition only `Pending Request` transactions to `Match Found`; calling it from any other state MUST return the documented invalid-state error.
- **FR-009**: Confirm-match (`EP-005`) MUST transition only `Match Found` transactions to `Awaiting Deposits`; calling it from any other state MUST return the documented invalid-state error.
- **FR-010**: Confirm-deposit (`EP-006`) MUST require a request body with `party` set to either `A` or `B`; deposit confirmations MUST set the matching deposit flag, and the resulting status MUST be `Deposit Confirmed Partially` when one flag is true, `Both Deposits Confirmed` when both flags are true, and the call MUST be rejected with the invalid-state error from any state outside `Awaiting Deposits` and `Deposit Confirmed Partially`.
- **FR-011**: Process-payouts (`EP-007`) MUST be callable only from `Both Deposits Confirmed`; the response MUST be the transaction with status `Processing Payouts`, and the server MUST transition the transaction to `Completed` within the documented settlement window without further frontend action.
- **FR-012**: Cancel (`EP-004`) MUST be callable only from `Pending Request` and `Match Found`, transitioning the transaction to `Failed`; calling it from any other state MUST return the invalid-state error.
- **FR-013**: Open-dispute (`EP-008`) MUST require a non-empty `reason` field, MUST transition any active transaction (states other than `Completed`, `Failed`, `Refunded`, `Disputed`) to `Disputed`, MUST persist `disputeReason`, and MUST append a dispute audit-log entry.
- **FR-014**: Flag-risk (`EP-011`) MUST transition any active transaction to `Under Review`; calling it from a terminal state MUST return the invalid-state error.
- **FR-015**: Admin-approve (`EP-012`) MUST be callable only from `Under Review`, transitioning the transaction to `Both Deposits Confirmed`.
- **FR-016**: Admin-refund (`EP-013`) MUST transition any active transaction to `Refunded`; calling it from a terminal state MUST return the invalid-state error.
- **FR-017**: Resolve-dispute (`EP-014`) MUST require a request body with `outcome` set to either `Completed` or `Refunded`, MUST be callable only from `Disputed`, and MUST transition the transaction accordingly.
- **FR-018**: Every state-changing endpoint MUST append exactly one audit-log entry per successful call recording `time` (server timestamp), `actor` (the calling user identifier or admin identifier), and `action` (a stable verb describing the transition).

#### Read endpoints, ownership, and authorization

- **FR-019**: The user transaction list (`EP-001`) MUST return only transactions owned by the authenticated caller, scoped to the documented response shape `{ "transactions": Transaction[] }`.
- **FR-020**: The single-transaction read (`EP-002`) MUST return `404` when the id does not exist and `403` when the id exists but is owned by another non-admin user.
- **FR-021**: The admin transaction list (`EP-009`) MUST return transactions across users and MUST accept an optional `status` query parameter that filters the result by exact status match.
- **FR-022**: Admin-only endpoints (`EP-009`, `EP-011`, `EP-012`, `EP-013`, `EP-014`) MUST reject non-admin callers with the canonical forbidden error.
- **FR-023**: All endpoints under FR-001 and FR-002 MUST continue to enforce the Phase 2 presence-of-credential authentication for protected routes; absent or empty `Authorization: Bearer …` MUST return the canonical unauthenticated error.

#### Data, persistence boundary, and frontend isolation

- **FR-024**: The implementation MAY use in-memory or process-local storage; durable persistence is Phase 5's responsibility. The choice of in-memory storage MUST NOT change the observable contract.
- **FR-025**: When the server restarts, the loss of in-memory state MUST NOT introduce any contract drift; clients receiving the canonical not-found error after a restart is acceptable Phase 4 behavior and MUST be documented in the implementation plan.
- **FR-026**: No file under `frontend/` MAY be modified by Phase 4 work, in line with constitution Principle I.
- **FR-027**: The platform configuration values used at creation time (`feePercent`, `exchangeRate`, `rateLockMinutes`, `paymentWindowMinutes`) MUST come from a single configuration source aligned with the Phase 1 `DemoConfig` entity; values MUST be resolvable without frontend assistance.

#### Test coverage and contract integration

- **FR-028**: Every endpoint covered by FR-001 and FR-002 MUST have a Phase 3 contract test that flips from "expected stub failure" to "passing contract" because of Phase 4 work, with no change to the contract assertions themselves (consistent with constitution Principle II and the Phase 3 spec's FR-020).
- **FR-029**: The Phase 3 default contract-test command, when run after Phase 4 lands, MUST exit successfully with the user-journey and admin-journey endpoints classified as passing and the auth endpoints (`EP-015`..`EP-018`) classified as expected stub failures.
- **FR-030**: Any new feature or unit test added by Phase 4 MUST be authored before the implementation it exercises (constitution Principle II), and the same change set MUST contain both.
- **FR-031**: Any contract assertion that needs to change because Phase 1 is amended (e.g., a frontend wire-up reveals a different request body) MUST update the Phase 1 contract and the contract test in the same change; the implementation MUST then be updated to match — the test MUST NOT be edited to match a drifted implementation.

#### Observability and operational basics

- **FR-032**: Every request handled by the endpoints under FR-001 and FR-002 MUST be logged via the Phase 2 structured request log middleware so reviewers can trace state transitions in development; the log format established in Phase 2 MUST NOT regress.
- **FR-033**: The health endpoint (`GET /healthz`) introduced in Phase 2 MUST continue to report a healthy status while Phase 4 is in progress and after Phase 4 is complete.

### Key Entities *(include if feature involves data)*

- **Transaction**: The core domain entity. Phase 4 advances each instance through its state machine (`Pending Request` → `Match Found` → `Awaiting Deposits` → `Deposit Confirmed Partially` → `Both Deposits Confirmed` → `Processing Payouts` → `Completed`, with branches into `Failed`, `Disputed`, `Under Review`, `Refunded`). All fields documented in `specs/002-api-discovery/api-contract.md` apply unchanged.
- **AuditLogEntry**: An entry appended to a transaction's `auditLog` on every successful state-changing call. Fields: `time`, `actor`, `action`. Phase 4 owns the population of this list.
- **User**: The authenticated caller's identity. Phase 4 derives ownership and admin-status checks from the bearer token's identity claim; Phase 2's presence-of-credential rule remains in force, and Phase 6 will replace it with full credential validation.
- **DemoConfig (platform configuration)**: The single source of truth for `feePercent`, `exchangeRate`, `rateLockMinutes`, and `paymentWindowMinutes` used by transaction creation and the payout settlement window. Phase 4 reads it; mutation of demo configuration remains a client-only concern (Phase 1's `setConfig` is `client_only`).
- **ErrorEnvelope**: The canonical error response shape for every non-2xx response, with `error.code`, `error.message`, and optional `error.details`. Phase 4 MUST emit specific stable codes for the failure classes used in this phase: unauthenticated, forbidden, not-found, validation-failed, invalid-state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user-journey endpoints (`EP-001`..`EP-008`, `EP-010`) return the documented success shape and status for at least one happy-path scenario when Phase 4 ships.
- **SC-002**: 100% of admin-journey endpoints (`EP-009`, `EP-011`..`EP-014`) return the documented success shape and status for at least one happy-path scenario when Phase 4 ships.
- **SC-003**: The Phase 3 default contract-test command, after Phase 4 lands, reports exactly 14 passing endpoint groups (the user-journey and admin-journey endpoints) and exactly 4 expected-stub-failure groups (the auth endpoints).
- **SC-004**: 0 endpoint paths, methods, or response shapes change relative to the Phase 1 contract; the route registry diff between Phase 2 and Phase 4 is empty for path/method.
- **SC-005**: A reviewer can complete the demo user journey (create → auto-match → confirm-match → confirm both deposits → process payouts → observe `Completed`) end-to-end in under 90 seconds against a freshly started backend with default platform configuration.
- **SC-006**: Every invalid-state, unauthorized, forbidden, not-found, and validation-error response across the Phase 4 endpoints uses the canonical error envelope; 0 endpoints emit ad-hoc error shapes.
- **SC-007**: 100% of state-changing successful calls append exactly one new audit-log entry; 0 successful state-changing calls leave the audit log unchanged.
- **SC-008**: 0 frontend files (`frontend/**`) are modified by Phase 4 work.
- **SC-009**: The Phase 3 contract suite, run after Phase 4 lands, classifies 0 endpoints as "unexpected contract failure" and 0 endpoints as "environment/setup failure".
- **SC-010**: Demo-path endpoint responses (create, auto-match, confirm-match, confirm-deposit, process-payouts) return within 200 ms p95 on a developer laptop with an empty in-memory store.
- **SC-011**: A new contributor can run the full Phase 4 happy-path scenario from a fresh clone in under 5 minutes (clone, install, start backend, run the documented happy-path test or curl sequence).
- **SC-012**: Every state-changing endpoint has at least one negative-path test demonstrating that calling it from a non-permitted state returns the canonical invalid-state error without mutating the transaction.

## Assumptions

- **Auth scope deferred to Phase 6**: `EP-015`..`EP-018` remain Phase 2 stubs in this phase. The de-facto contract Phase 4 implements relies on Phase 2's presence-of-credential bearer-token middleware; Phase 6 will replace this with credential validation and token issuance per Phase 1's `CR-002`.
- **Server-issued IDs**: Per Phase 2's resolution of Phase 1's `CR-003`, transaction ids are assigned by the server. The Phase 1 demo-store id format (`TR-####`) is honored as a stable shape but the source of truth for assignment is the backend, not the frontend.
- **Auto-match semantics**: Auto-match in this phase produces a `Match Found` transition for the requested transaction without requiring a real counterparty transaction in the store. This matches the frontend's demo behavior at `frontend/src/context/DemoContext.tsx` and is consistent with the Phase 1 derivation. A real two-sided matching algorithm is out of scope for Phase 4 and is a candidate for a later phase.
- **Process-payouts settlement window**: `EP-007` returns `Processing Payouts` immediately, and the server transitions the transaction to `Completed` within the platform configuration's `paymentWindowMinutes` (or a shorter demo-friendly window for development). The frontend already polls `EP-002`, so the transition is observable without any other call.
- **In-memory storage**: Phase 4 uses in-memory or process-local storage; durable persistence is Phase 5's responsibility. Restarts are expected to reset the data set in this phase. The contract MUST NOT change when persistence lands.
- **Admin identity**: Admin authority is determined from the bearer token's identity claim using a process-local allowlist or an admin flag on the user record; the precise mechanism is for the implementation plan. The Phase 6 auth implementation will replace the Phase 4 mechanism, but the observable contract (`403` for non-admins on admin endpoints) MUST be preserved.
- **Transaction ownership**: Every transaction is owned by the user that created it. Phase 4 enforces this on read endpoints (`EP-001` lists only the caller's transactions; `EP-002` returns `403` for another user's id) and on user-journey state-changing endpoints. Admin endpoints intentionally bypass the ownership check.
- **Currency, fee, and rate handling**: Currency, fee percent, and exchange rate are taken from the platform configuration documented in Phase 1's `DemoConfig`. Phase 4 does not introduce new pricing logic; if the frontend's behavior implies multi-currency conversion that the platform configuration does not cover, that is a Phase 1 amendment and not a Phase 4 implementation choice.
- **Phase 1 is the authoritative contract source**: Any discrepancy between this spec and Phase 1's `api-contract.md` is resolved in favor of `api-contract.md`. If Phase 4 work uncovers a contract gap, the Phase 1 audit MUST be amended in the same change set.
- **Constitution governance**: The deviations and dispensations recorded in Phase 2's plan (Laravel mount-point reconfiguration; Phase 3 dispensation for derived endpoints) remain in force and apply to Phase 4. No new constitution-level deviations are anticipated by this spec; if implementation uncovers a need for one, it MUST be recorded in the implementation plan's Complexity Tracking.
- **Frontend remains untouched**: No file under `frontend/` is modified by Phase 4 work (constitution Principle I).
