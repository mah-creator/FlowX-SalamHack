# Feature Specification: API Discovery (Phase 1)

**Feature Branch**: `002-api-discovery`
**Created**: 2026-04-29
**Status**: Ratified
**Input**: User description: "Read BACKEND_PLAN.md and create a specification for the Phase1: API Discovery"

## Clarifications

### Session 2026-04-29

- Q: Should the Phase 1 deliverable cover only the literal HTTP audit (currently empty), only a derived API surface, or both — given the constitution's Principle III "observed behavior" rule? → A: Both observed and derived. Produce the literal HTTP audit AND the inferred API surface from `DemoContextValue` methods, reducer action types, page flows, and entity shapes; classify each entry observed-vs-derived per FR-007 with a Phase 3 grounding note per FR-009 for derived entries.
- Q: How should declared-but-uninvoked third-party SDKs in the frontend (e.g., `@google/genai` is in `frontend/package.json` but never imported under `frontend/src/`) be treated by Phase 1's deliverable? → A: Out of scope for the backend's API surface, but recorded. The deliverable carries a "Third-Party Integrations" section listing each declared SDK with its audit-time invocation status; integrations are excluded from endpoint entries unless they are actually invoked from `frontend/src/`.
- Q: Should Phase 1 take a position on identifier origin (server-issued vs. client-issued) for each entity, given that the frontend currently generates IDs client-side (e.g., `nextTxId` produces `TR-####` strings, `crypto.randomUUID()` for notifications)? → A: Describe only. Per entity, record the observed ID origin in the audit (with source citation). On each endpoint entry that creates an entity, list both candidate positions (server-issued, client-supplied, or either) without picking one; the resolution is deferred to Phase 2's plan.
- Q: How should `TxStatus` transitions (11 values, some externally triggered, some auto-transitions like `processPayouts` → `Completed` via `setTimeout`) be mapped to endpoints in the deliverable? → A: One endpoint per externally-triggered operation; `status` is a server-computed field on the transaction resource. Each user- or admin-initiated operation (create, confirm-deposit, open-dispute, admin-approve, admin-refund, etc.) maps to one endpoint that may transition status as a side effect. Auto-transitions (e.g., `Processing Payouts` → `Completed`) are documented as server-side state observable via a transaction read endpoint, not as separate client-callable endpoints.
- Q: For authentication, the frontend has zero auth wiring at audit time (no `Authorization` header, no token storage, no login call). Should Phase 1 only describe this finding, or also recommend a wire-level auth scheme to give Phase 6 a concrete starting point? → A: Describe and recommend. The deliverable records the "no auth observed at audit time" finding, documents the signup/verify UI flows and the `User` entity field-level shape, AND recommends a wire-level auth scheme for Phase 6 to plan against. The recommendation is at the wire level only (header/cookie/token shape) — the choice between Laravel auth packages (Sanctum vs. Passport) remains a Phase 2/6 concern under constitution Principle IV.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — A complete, sourced inventory of the frontend's API surface (Priority: P1)

A backend planner is about to begin Phase 2 (Backend Foundation) and Phase 3
(Contract Testing). Before any backend route, validation rule, or response
shape is decided, they need a single document that lists every interaction
the React frontend depends on — every HTTP request the frontend makes today,
every operation the frontend performs locally that a backend will eventually
need to back, and every data entity the frontend consumes — with each item
traced back to a concrete location in the frontend source. With this
document in hand, they can plan Phase 2 and write contract tests in Phase 3
without re-reading the frontend repository line by line.

**Why this priority**: Every later backend phase consumes this document. If
it is incomplete or unsourced, Phase 3 contract tests degrade into
"documentation-driven" tests (forbidden by constitution Principle III), and
Phase 2 routing is shaped by intuition rather than observed frontend
behavior. P1 because no later backend work can responsibly start without it.

**Independent Test**: A reviewer who has never seen the frontend can take
the Phase 1 deliverable and, for any listed endpoint or operation, follow
its source citation back to the exact frontend file and symbol that
grounds the claim, then confirm the documented request shape, response
shape, and status semantics match what that source implies — without
asking the original author any clarifying question.

**Acceptance Scenarios**:

1. **Given** the Phase 1 deliverable exists, **When** a Phase 2 planner
   asks "what HTTP routes must the backend expose?", **Then** the document
   answers with a full list, each entry naming method, path, request
   parameters, response shape, expected status codes, error envelope, and
   the frontend source citation that justifies it.
2. **Given** the Phase 1 deliverable exists, **When** a Phase 3 contract
   test author needs to write a contract test for any listed endpoint,
   **Then** the document provides the source citation required by
   constitution Principle III without further investigation.
3. **Given** the Phase 1 deliverable exists, **When** a reviewer audits
   any endpoint entry, **Then** they can determine in one read whether
   the entry is grounded in an *observed* HTTP request the frontend
   actually issues today, or in a *derived* operation (state action, UI
   flow, entity shape) inferred from the frontend.

---

### User Story 2 — Every frontend operation is accounted for (Priority: P2)

A reviewer is checking that nothing the frontend does has been silently
omitted from the backend plan. They take the Phase 1 deliverable, the
frontend's `src/types.ts`, `src/lib/demoStore.ts`, `src/context/DemoContext.tsx`,
and the page components under `src/pages/`, and they confirm that every
exposed operation, every reducer action, every page-level user journey,
and every typed entity is either represented in the API contract document
or explicitly marked "client-only / no backend operation required". No
fourth category is allowed.

**Why this priority**: Drift between the frontend's actual operations and
what Phase 1 enumerates is the failure mode this spec must prevent. P2
because it builds on User Story 1 (the inventory exists) and is the
mechanism that proves the inventory is complete.

**Independent Test**: A reviewer can produce a single table cross-referencing
each `DemoContextValue` method, each reducer action `type`, and each `pages/*.tsx`
component against the Phase 1 deliverable, with every row resolving to either
"covered by endpoint X" or "explicitly client-only", with zero rows resolving
to "missing".

**Acceptance Scenarios**:

1. **Given** the deliverable, **When** a reviewer enumerates every method
   on `DemoContextValue` (e.g., `createTransaction`, `confirmDeposit`,
   `processPayouts`, `openDispute`, `adminApprove`, etc.), **Then** each
   method maps to either an endpoint entry or an explicit client-only note.
2. **Given** the deliverable, **When** a reviewer enumerates every page
   component under `frontend/src/pages/`, **Then** each page has at least
   one referencing endpoint or an explicit client-only note.
3. **Given** the deliverable, **When** a reviewer enumerates every typed
   entity surfaced by the frontend (`User`, `Transaction`, `NotificationItem`,
   audit log entries, demo configuration), **Then** each entity has a
   field-level breakdown in the deliverable.

---

### User Story 3 — Constraints with the constitution are surfaced explicitly (Priority: P3)

The constitution (Principle I and Principle III) requires the React frontend
to be the authoritative source of the API contract and requires every
contract test to be derived from the frontend's *observed* behavior. A
maintainer reading the Phase 1 deliverable needs to see, on the face of the
document, every place where the frontend's current behavior cannot — by
itself — ground a contract test (for example, an operation that today is
fulfilled entirely client-side and issues no HTTP request). These places
must be flagged so that Phase 2 planning, Phase 3 test authoring, and any
follow-up constitution discussion can decide how to proceed without
discovering the gap mid-implementation.

**Why this priority**: A silent contradiction with the constitution turns
into a Phase 3 blocker. P3 because the inventory is more urgent (Stories 1
and 2), but no later phase can responsibly start until the contradictions
are visible and labelled.

**Independent Test**: A maintainer can list every endpoint entry whose
source citation is "derived" rather than "observed" and, for each one,
read in the deliverable a one-sentence statement of how Phase 3 is expected
to ground its contract test (e.g., capture from a future frontend change,
defer until the frontend wires up the call, or treat the local operation
as the de facto contract).

**Acceptance Scenarios**:

1. **Given** the deliverable, **When** the maintainer filters for endpoints
   marked "derived", **Then** every such endpoint includes an explicit note
   on how it will be grounded for contract testing.
2. **Given** the deliverable, **When** a reviewer asks "are there any places
   where the constitution's Principle III cannot be satisfied with current
   frontend behavior?", **Then** the deliverable answers yes/no and, if
   yes, lists each such place.
3. **Given** the deliverable, **When** a contributor proposes a Phase 3
   contract test, **Then** they can determine from the deliverable alone
   whether the source citation is strong enough to satisfy Principle III
   or requires additional discovery work first.

---

### Edge Cases

- The frontend currently issues **no outbound HTTP requests** (no `fetch`,
  no `axios`, no `XMLHttpRequest` usage in `frontend/src`). The deliverable
  must record this finding explicitly rather than silently producing a
  document that looks like a normal observed-traffic audit.
- An operation can be fulfilled entirely client-side today (e.g., demo
  notifications dismissed via local reducer). The deliverable must let
  reviewers tell "client-only by design" apart from "backend-required but
  currently unimplemented".
- Two frontend flows may imply the same backend operation with mismatched
  request or response shapes (e.g., user-initiated cancel vs. admin
  refund). The deliverable must reconcile these into a single endpoint
  entry, or document them as separate endpoints with explicit reasoning.
- Identifiers (`crypto.randomUUID()` for notifications, `nextTxId` for
  transactions) are produced client-side today. The deliverable must
  record where IDs originate so Phase 2 can decide whether the backend
  generates them, accepts them from the client, or both.
- Field shapes may drift between `src/types.ts` and `src/lib/demoStore.ts`
  (e.g., `User.fullName` vs. demo-store user `name`). The deliverable
  must call out drift between sources and pick a canonical shape per
  entity, citing which source it came from.
- A future frontend change may add an HTTP call that contradicts an entry
  already in the deliverable. The deliverable must define how it gets
  amended (per constitution Principle V, Phase 1 may be incrementally
  extended) so it does not silently fall out of date.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Phase 1 MUST produce a single canonical API contract
  document at a known stable path inside this feature directory. The
  document MUST be the authoritative input that Phase 2 (Backend
  Foundation) and Phase 3 (Contract Testing) work from.
- **FR-002**: The discovery activity MUST audit the React frontend
  (`frontend/`) for every outbound HTTP interaction (e.g., `fetch`,
  `axios`, `XMLHttpRequest`, library wrappers, service-worker proxies)
  and record the result. If zero such interactions are present at audit
  time, that finding MUST be stated explicitly in the deliverable, with
  evidence of how the audit was conducted.
- **FR-003**: For every page-level user journey under `frontend/src/pages/`
  (e.g., signup, verification, new transfer, awaiting deposit, match
  found, transaction status, dispute, admin dashboard, dashboard,
  landing), the deliverable MUST list every backend operation that
  journey implies, or MUST mark the page explicitly as "no backend
  operation required".
- **FR-004**: For every method exposed by the frontend's central state
  module (e.g., `DemoContextValue` methods such as `createTransaction`,
  `cancelTransaction`, `autoMatch`, `confirmMatch`, `confirmDeposit`,
  `processPayouts`, `openDispute`, `resolveDispute`, `flagRisk`,
  `adminApprove`, `adminRefund`, `triggerTimeout`, `setConfig`,
  `resetDemo`, `dismissNotification`) and for every reducer action type
  it dispatches, the deliverable MUST either map it to an endpoint
  entry or explicitly mark it client-only.
- **FR-005**: For every typed data entity the frontend consumes (e.g.,
  `User`, `Transaction`, `NotificationItem`, audit log entries, demo
  configuration), the deliverable MUST capture a field-level breakdown:
  field name, type, required vs. optional, allowed values where
  enumerated, and an example value where one exists in the frontend.
- **FR-006**: For each candidate endpoint, the deliverable MUST capture
  HTTP method, route path, query parameters, request headers the frontend
  sends or expects (including `Content-Type`, `Accept`, and any auth
  header), request body shape, response body shape, all expected status
  codes (success and error), error response envelope, authentication
  requirement, and a frontend source citation.
- **FR-007**: Every endpoint entry MUST classify its source as either
  *observed* (a real HTTP request the frontend issues today, captured
  from source or runtime) or *derived* (inferred from a state operation,
  page flow, or entity shape). The classification MUST be visible at
  the entry level, not buried in prose.
- **FR-008**: Every endpoint entry, regardless of classification, MUST
  carry a source citation in the form of a concrete frontend artefact —
  file path with a symbol or line reference, captured request fixture,
  or page component name — sufficient for a reviewer to verify the entry
  without consulting the original author.
- **FR-009**: For every endpoint entry classified *derived*, the
  deliverable MUST include a note describing how Phase 3 is expected to
  ground its contract test for that endpoint (e.g., capture from a
  future frontend change, treat the local state operation as the de
  facto contract, defer testing until the frontend wires the call).
- **FR-010**: The deliverable MUST capture the frontend's authentication
  posture in two parts:
  (a) **Audit (descriptive).** The deliverable MUST record how (or
  whether) the frontend currently sends or stores credentials, what
  header or cookie names appear, whether any authenticated state is
  observable at all, and what UI flows imply authentication (e.g.,
  `SignupPage`, `VerificationPage`, `User` entity shape in
  `src/types.ts`). This audit MUST cover both observed and derived
  findings and MUST cite the frontend source for each finding.
  (b) **Recommendation (forward-looking).** The deliverable MUST
  recommend a wire-level auth scheme for Phase 6 to plan against —
  i.e., the request/response contract the eventual backend will
  honour. The recommendation MUST specify, at minimum: the auth header
  or cookie name(s), the credential format (token / session / other),
  the endpoint shapes implied by the recommended scheme (e.g.,
  login/logout/refresh), and the failure-response envelope for
  unauthenticated/unauthorized requests. The recommendation is at the
  wire level only — the choice of Laravel auth package (Sanctum,
  Passport, or other) is explicitly out of scope and remains a Phase
  2/6 decision under constitution Principle IV. The recommendation
  MUST be flagged as derived (per FR-007) and MUST carry a Phase 3
  grounding note (per FR-009) since no current frontend behavior
  grounds it.
- **FR-011**: The deliverable MUST contain no backend implementation
  details — no choice of language, framework, library, ORM, database
  engine, file layout, or class names — only the externally observable
  contract the frontend depends on. (Constitution Principle IV's
  framework choice is recorded elsewhere; Phase 1 stays
  technology-agnostic on the wire.)
- **FR-012**: The deliverable MUST be reviewable in a single pass: every
  claim it makes MUST be verifiable from its source citation without a
  reviewer having to re-derive it from first principles in the frontend.
- **FR-013**: The deliverable MUST identify any frontend flow or
  operation that is intentionally client-only and explicitly exclude it
  from the backend's responsibility, so Phase 2 does not over-build.
- **FR-014**: The deliverable MUST surface every contradiction between
  the frontend's current behavior and constitution Principle I (the
  frontend defines the contract) or Principle III (contract tests are
  derived from observed frontend behavior). Each such contradiction
  MUST be labelled with the affected entries and a recommended path
  forward (without resolving the constitution itself — that is out of
  scope for Phase 1).
- **FR-015**: The deliverable MUST be incremental-friendly. It MUST
  carry a version or last-updated marker and a changelog section so
  later phases can extend it (per constitution Principle V) without
  rewriting it, and so any addition is visibly traceable.
- **FR-016**: The deliverable MUST NOT modify any file under `frontend/`.
  Phase 1 is purely descriptive (constitution Principle I). Audit
  activities that require running the frontend MUST do so without
  editing its source.
- **FR-017**: The deliverable MUST contain a "Third-Party Integrations"
  section that enumerates every external-service SDK declared in
  `frontend/package.json` (for example, `@google/genai` and any future
  additions), and for each one MUST record (a) whether it is imported
  or invoked anywhere under `frontend/src/` at audit time, and (b)
  whether any environment variable wiring exists for it (e.g.,
  `GEMINI_API_KEY` in `frontend/vite.config.ts`). Integrations that
  are *not* invoked from `frontend/src/` MUST be marked out of scope
  for the backend's API surface and MUST NOT generate endpoint entries.
  Integrations that *are* invoked from `frontend/src/` MUST be captured
  as endpoint entries on the same observed-vs-derived basis as any
  other operation (FR-007).
- **FR-018**: For every data entity that carries an identifier, the
  deliverable MUST record the observed ID origin in the audit — where
  the value is produced today (e.g., client-side via
  `crypto.randomUUID()` or `nextTxId`), with a source citation. The
  deliverable MUST NOT take a position on whether the backend will
  ultimately issue the ID. For every endpoint entry whose request
  creates such an entity, the entry MUST list the candidate ID-origin
  positions (server-issued, client-supplied, or either) without
  selecting one; the resolution is explicitly deferred to Phase 2's
  plan.
- **FR-019**: The deliverable MUST map status transitions to endpoints
  using the following convention: each externally-triggered operation
  (user- or admin-initiated, e.g., `createTransaction`,
  `confirmDeposit`, `openDispute`, `adminApprove`, `adminRefund`)
  yields one endpoint entry that may transition status as a documented
  side effect. The status value itself MUST be modelled as a
  server-computed field on the transaction resource, not as a
  client-writable property. Auto-transitions that the frontend
  performs without an outbound request today (e.g., `processPayouts`
  flipping `Processing Payouts` → `Completed` via `setTimeout`) MUST
  be documented as server-side state changes observable via a
  transaction read endpoint, and MUST NOT generate separate
  client-callable endpoints. For each transition documented, the
  entry MUST cite the frontend operation, page flow, or component
  that grounds it.

### Key Entities

- **API Contract Document**: The single canonical artefact produced by
  Phase 1. Attributes: location, version/last-updated marker, table of
  endpoints, table of entities, audit-method note, changelog,
  contradiction register.
- **Endpoint Entry**: One record per candidate backend operation.
  Attributes: HTTP method, path, query parameters, request headers,
  request body shape, response body shape, status codes, error envelope,
  authentication requirement, classification (observed | derived),
  source citation, Phase 3 grounding note (for derived entries),
  related frontend operation(s) and page(s).
- **Frontend Operation**: A specific function or reducer action exposed
  by the frontend's central state module. Attributes: name, signature,
  source file, brief description, mapped endpoint entry (or "client-only").
- **Frontend Flow**: A page-level user journey under
  `frontend/src/pages/`. Attributes: page name, summary, sequence of
  frontend operations involved, mapped endpoint entries (or
  "no backend operation required").
- **Data Entity**: A typed object the frontend consumes. Attributes:
  name, source file (e.g., `src/types.ts` or `src/lib/demoStore.ts`),
  field-level breakdown, drift notes if multiple sources disagree,
  example value.
- **Source Citation**: The concrete pointer that grounds an endpoint
  entry, an operation mapping, or an entity field-level breakdown.
  Attributes: kind (file path + symbol, captured request fixture,
  component name), value, reviewer-checkable in isolation.
- **Contradiction Register Entry**: A recorded place where the frontend's
  current behavior cannot, by itself, ground a contract test. Attributes:
  affected endpoint(s), constitutional principle implicated, recommended
  path forward, owner (Phase 2 / Phase 3 / constitution amendment).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of endpoint entries in the deliverable carry a source
  citation that a reviewer can verify against the frontend in under one
  minute, without further input from the entry's author.
- **SC-002**: 100% of pages under `frontend/src/pages/` are addressed by
  at least one endpoint entry or carry an explicit "no backend operation
  required" note. Zero pages are left untouched by the deliverable.
- **SC-003**: 100% of methods on the frontend's central state module
  (e.g., every method on `DemoContextValue`) and 100% of reducer action
  types it dispatches are addressed by at least one endpoint entry or
  carry an explicit "client-only" note. Zero items are left untouched.
- **SC-004**: 100% of typed data entities the frontend consumes are
  documented in the deliverable with a field-level breakdown. Zero
  entities are left undocumented.
- **SC-005**: A new contributor (human or AI agent) reading only the
  Phase 1 deliverable can answer "what request does the frontend send
  for endpoint X, what does it expect back, and where in the frontend
  is that grounded?" for any listed endpoint in under five minutes.
- **SC-006**: 0 endpoint entries in the deliverable rely on
  documentation, intuition, or backend wishful thinking without a
  concrete source citation (per constitution Principle III).
- **SC-007**: 100% of endpoint entries classified *derived* carry an
  explicit Phase 3 grounding note describing how a contract test for
  that endpoint will be sourced.
- **SC-008**: 100% of contradictions between the frontend's current
  behavior and constitution Principles I/III that exist at audit time
  appear in the deliverable's contradiction register, each with an
  affected-entries list and a recommended owner.
- **SC-009**: The deliverable contains 0 references to backend
  implementation choices (language, framework, ORM, database engine,
  internal class names). Wire-level facts only.
- **SC-010**: 0 files under `frontend/` are modified by Phase 1 work.
  The frontend tree at the time Phase 1 closes is identical to the
  frontend tree at the time Phase 1 opened.
- **SC-011**: At any point after Phase 1 closes, the deliverable carries
  a current version or last-updated marker and a changelog so any
  subsequent extension under constitution Principle V is visibly
  traceable.
- **SC-012**: 100% of external-service SDKs declared in
  `frontend/package.json` are accounted for in the deliverable's
  Third-Party Integrations section with their audit-time invocation
  status (invoked from `frontend/src/` vs. declared-but-uninvoked) and
  any associated environment-variable wiring. 0 declared SDKs are
  left unmentioned.
- **SC-013**: 100% of data entities that carry an identifier have the
  observed ID origin recorded with a source citation, and 100% of
  endpoint entries that create such an entity list the candidate
  ID-origin positions without selecting one. 0 entries silently lock
  in an ID-origin choice.
- **SC-014**: 100% of `TxStatus` values are accounted for in the
  deliverable as either (a) the result of an externally-triggered
  endpoint's documented side effect, or (b) an auto-transition
  observable via the transaction read endpoint with a source citation
  for the trigger. 0 `TxStatus` values are unexplained, and 0 status
  values appear as separate client-callable transition endpoints.
- **SC-015**: The deliverable contains both the auth audit (with
  zero-or-more cited findings about current frontend auth wiring) and
  a recommended wire-level auth scheme for Phase 6 that specifies, at
  minimum, the auth header or cookie name(s), the credential format,
  the endpoint shapes the recommended scheme implies, and the
  unauthenticated/unauthorized error envelope. The recommendation
  contains 0 references to specific Laravel packages or other backend
  implementation choices. The recommendation is explicitly flagged as
  derived and carries a Phase 3 grounding note.

## Assumptions

- The current React frontend at `frontend/` is the audit target. The
  audit covers the source under `frontend/src/` (pages, components,
  context, lib, types) at the commit on branch `002-api-discovery` at
  the time Phase 1 closes.
- A source-level grep of `frontend/src/` for `fetch(`, `axios`,
  `XMLHttpRequest`, and similar patterns shows no outbound HTTP usage
  at audit time. The deliverable will record this finding explicitly,
  and the discovery activity will treat the frontend's local state
  module (`src/lib/demoStore.ts`, `src/context/DemoContext.tsx`),
  page components, and typed entities as the authoritative basis for
  the *derived* portion of the API surface.
- The hackathon goal is for the existing frontend to consume a real
  backend without source-code changes (constitution Principle I).
  Phase 1 anticipates this by producing the API surface the frontend
  *would* consume given its current behavior, even where the wire
  request does not yet exist. Constitution Principle III's "observed
  behavior" requirement is explicitly addressed by the
  observed-vs-derived classification (FR-007) and the Phase 3
  grounding note (FR-009).
- Phase 1 does not modify, propose modifying, or commit modifications
  to the frontend. Any decision about adapting the frontend to issue
  HTTP requests (or amending the constitution to accommodate the
  current state) is out of scope and will be flagged via the
  contradiction register (FR-014) for resolution in a later phase or
  separate amendment cycle.
- The deliverable's location is inside this feature directory
  (`specs/002-api-discovery/`). Format choice — single Markdown
  document, OpenAPI/JSON Schema sidecar, or both — is a Phase 1
  planning concern and is left to `/speckit-plan`. Whatever format is
  chosen, FR-001 requires it to be canonical and singly addressable.
- Phase 1 is descriptive only. No backend code, route stubs, validation
  classes, response resources, or test scaffolding are produced in
  Phase 1; those belong to Phases 2 and 3 respectively.
- Phase 1 may be incrementally extended later (constitution Principle V)
  when additional frontend behavior is discovered. The changelog and
  version marker required by FR-015 exist precisely to support that.
