# Feature Specification: Contract Testing (Phase 3)

**Feature Branch**: `004-contract-testing`  
**Created**: 2026-04-29  
**Status**: Draft  
**Input**: User description: "Read BACKEND_PLAN.md and create a specification for the Phase3: Contract Testing"

## Clarifications

### Session 2026-04-29

- Q: Should the Phase 3 contract suite pass against the Phase 2 foundation when all product endpoint failures are expected stubs, or fail until business responses exist? -> A: Contract suite exits successfully against Phase 2 if all failures are expected stub failures and there are zero unexpected drifts.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Full endpoint contract coverage (Priority: P1)

A contract-test author needs a complete verification suite that covers every backend endpoint discovered from the frontend. They can run one documented command and see one test group per endpoint, with each group checking the endpoint's route, request requirements, expected success shape, expected status codes, and documented error shapes. The suite uses the Phase 1 contract as the source of truth and makes missing, renamed, prefixed, or shape-drifted endpoints immediately visible.

**Why this priority**: Phase 4 cannot safely implement business behavior until there is a failing test harness that defines the expected contract for all endpoint work. P1 because incomplete coverage leaves later implementation free to drift from the frontend contract.

**Independent Test**: From a fresh clone with the Phase 2 backend available, a reviewer runs the documented contract-test command and sees contract tests executed for all 18 endpoint IDs (`EP-001` through `EP-018`). Every endpoint has at least one assertion that proves its documented method and path are being exercised.

**Acceptance Scenarios**:

1. **Given** the Phase 1 contract lists 18 endpoint IDs, **When** the reviewer runs the Phase 3 contract suite, **Then** the report includes coverage for all 18 IDs with no missing endpoint groups.
2. **Given** an endpoint path is accidentally renamed, prefixed, or removed, **When** the contract suite runs, **Then** the related endpoint test fails with a message that identifies the affected endpoint ID and method/path.
3. **Given** an endpoint has a documented success response shape, **When** the corresponding contract test receives a non-stub success response, **Then** the response body is checked against the documented shape rather than accepted as an unstructured payload.

---

### User Story 2 - Stub-aware failure signals for the Phase 2 foundation (Priority: P2)

A backend implementer needs Phase 3 tests that can run against the Phase 2 foundation before business logic exists. The tests should distinguish expected stub failures from real infrastructure drift. Stub responses should be reported as "contract not yet implemented" for the expected endpoint, while missing routes, wrong auth posture, wrong content type, or wrong error envelope should fail as foundation regressions.

**Why this priority**: Phase 2 intentionally returns placeholder responses. Without stub-aware reporting, the test suite either produces noisy failures that are hard to act on or incorrectly passes placeholder behavior as if the endpoint contract were implemented.

**Independent Test**: A reviewer runs the contract suite against the Phase 2 foundation and confirms that each product endpoint is reachable at the correct path, authenticated routes reject anonymous requests correctly, and Bearer-present requests reach the documented placeholder response for the matching endpoint ID.

**Acceptance Scenarios**:

1. **Given** the backend still returns documented placeholder responses, **When** the contract suite runs, **Then** each product endpoint's placeholder response is recognized as a known "not implemented yet" state tied to the correct endpoint ID.
2. **Given** an authenticated endpoint is requested without credentials, **When** the contract suite runs, **Then** the test expects the documented authentication error rather than treating the endpoint as implemented.
3. **Given** a placeholder response carries the wrong endpoint ID or a non-standard error shape, **When** the contract suite runs, **Then** the related test fails as a Phase 2 contract drift.

---

### User Story 3 - Regression evidence for future implementation phases (Priority: P3)

A reviewer of Phase 4 and later changes needs a stable baseline that proves business implementations preserve the frontend-facing contract. They can compare test results across phases and see whether a change improves an expected stub failure into a passing success case or introduces a new contract regression.

**Why this priority**: Contract tests become the safety net for every later backend phase. P3 because the initial deliverable is valuable as soon as coverage and stub-aware failures exist, but long-term usefulness depends on clear reporting, traceability, and regression classification.

**Independent Test**: A reviewer reviews a contract-test report and can identify, for each endpoint, whether the failure is expected because the endpoint remains a stub, unexpected because the contract drifted, or passing because the endpoint now satisfies its documented contract.

**Acceptance Scenarios**:

1. **Given** a later implementation replaces a stub with a conforming success response, **When** the contract suite runs, **Then** that endpoint moves from expected stub failure to pass without changing the documented contract.
2. **Given** a later implementation changes a status code, required field, enum value, or error envelope unexpectedly, **When** the contract suite runs, **Then** the report identifies the specific contract mismatch.
3. **Given** a reviewer audits contract progress, **When** they inspect the report, **Then** they can count total endpoints, passing endpoints, expected stub failures, and unexpected regressions.

---

### Edge Cases

- The Phase 1 contract is amended after Phase 3 closes. The contract suite must surface any mismatch between the amended endpoint list and test coverage rather than silently retaining outdated tests.
- The backend is not running or not reachable. The report must clearly distinguish environment/setup failure from endpoint contract failure.
- An endpoint returns valid JSON with the wrong content type. The contract suite must treat this as a contract failure.
- An endpoint returns the correct status code with missing or extra response fields. The contract suite must treat this as a shape failure.
- An endpoint returns the documented error envelope with an unstable or undocumented `error.code`. The suite must fail the error contract check.
- Auth endpoints (`EP-015` through `EP-018`) are derived from recommendations rather than observed frontend calls. The suite must keep this provenance visible while still testing the de-facto contract allowed by the Phase 2 dispensation.
- File-upload verification behavior is not implemented yet. The contract suite must still encode the documented verification request shape enough to prevent the route and error behavior from drifting before full upload handling lands.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The contract testing feature MUST define executable contract checks for every endpoint ID listed in the Phase 1 contract (`EP-001` through `EP-018`).
- **FR-002**: Each endpoint contract check MUST include the documented method, path, authentication requirement, expected request body requirements when applicable, expected success status code(s), expected success response shape, documented error status codes, and error envelope shape.
- **FR-003**: The suite MUST fail if any Phase 1 endpoint lacks a corresponding contract check, or if any contract check references an endpoint ID that no longer exists in the Phase 1 contract.
- **FR-004**: The suite MUST verify that all endpoint paths remain unprefixed and match the Phase 1 paths exactly.
- **FR-005**: The suite MUST verify that every response under test uses JSON content when a JSON body is returned.
- **FR-006**: The suite MUST verify the canonical error envelope for authentication errors, validation errors, missing resources, invalid states, and unimplemented stubs.
- **FR-007**: The suite MUST verify that endpoints marked as requiring credentials reject anonymous requests with the documented authentication error.
- **FR-008**: The suite MUST verify that endpoints marked as public do not require credentials for the first observable request path.
- **FR-009**: The suite MUST verify that placeholder responses from the Phase 2 foundation remain tied to the correct endpoint ID and are not treated as successful business behavior.
- **FR-010**: The suite MUST classify each endpoint result as one of: passing contract, expected stub failure, unexpected contract failure, or environment/setup failure.
- **FR-010a**: When run in the Phase 2 foundation context, the suite MUST exit successfully if every non-passing product endpoint result is classified as an expected stub failure and there are zero unexpected contract failures or environment/setup failures.
- **FR-011**: The suite MUST include request-shape checks for endpoints with request bodies, including required fields, forbidden client-supplied IDs for transaction creation and signup, allowed enum values, and empty-body operations.
- **FR-012**: The suite MUST include response-shape checks for the documented domain entities: user, transaction, transaction status, notification item, audit-log entry, demo configuration when relevant, and error envelope.
- **FR-013**: The suite MUST preserve source traceability for each endpoint by recording its Phase 1 source citation and grounding note in the contract-test inventory or report.
- **FR-014**: The suite MUST preserve the Phase 2 dispensation context for derived endpoints so reviewers can see that tests are proceeding against a de-facto contract until the frontend is wired or the constitution is amended.
- **FR-015**: The suite MUST provide one documented command for running all contract tests and one documented command or filter for running a single endpoint's contract checks.
- **FR-015a**: The documented default contract-test command for Phase 3 MUST run in foundation mode, where expected stub failures are reported but do not make the command fail.
- **FR-016**: The suite MUST produce a reviewer-readable summary showing total endpoint count, covered endpoint count, passing count, expected stub failure count, unexpected failure count, and skipped/deferred count.
- **FR-017**: The suite MUST NOT require changes to the frontend application to run.
- **FR-018**: The suite MUST NOT implement backend business behavior, persistence, authentication issuance, or authorization decisions; it only verifies observable contract behavior.
- **FR-019**: The suite MUST detect drift between the Phase 2 route registry and the Phase 1 endpoint contract, including missing routes, extra product routes, wrong auth requirement, or changed method/path.
- **FR-020**: The suite MUST document how future phases should turn an expected stub failure into a passing contract result without changing the contract itself.

### Key Entities

- **Endpoint Contract Check**: A verification unit for one endpoint ID. Key attributes: endpoint ID, method, path, auth requirement, request shape, expected success status, expected success body shape, documented error statuses, source citation, grounding note.
- **Contract Test Inventory**: The complete list of endpoint checks for Phase 3. Key attributes: total endpoint count, coverage status, provenance for derived/observed contracts, and links back to the authoritative contract source.
- **Contract Result**: The outcome of running one endpoint check. Key attributes: endpoint ID, result classification, observed status, observed content type, observed body shape, and failure reason.
- **Expected Stub Failure**: A result classification meaning the endpoint is reachable and returns the known Phase 2 placeholder for the correct endpoint ID, but business behavior is not implemented yet.
- **Contract Drift Failure**: A result classification meaning observed behavior differs from the documented contract in method/path, auth posture, status code, content type, response shape, request handling, or error envelope.
- **Contract Report**: The reviewer-facing summary of coverage and results. Key attributes: total endpoints, covered endpoints, passing endpoints, expected stub failures, unexpected failures, skipped/deferred checks, and run timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 18 Phase 1 endpoint IDs have at least one executable contract check.
- **SC-002**: A reviewer can run the full contract suite from a fresh clone in under 2 minutes after completing Phase 2 setup.
- **SC-003**: The contract report shows exactly 18 covered Phase 1 endpoints and 0 uncovered Phase 1 endpoints.
- **SC-004**: When run against the Phase 2 foundation, 100% of product endpoints are either classified as expected stub failures or as explicit contract failures; 0 endpoint results are ambiguous.
- **SC-004a**: When run against an unchanged Phase 2 foundation, the default contract-test command exits successfully while reporting expected stub failures for unimplemented product behavior.
- **SC-005**: 100% of authenticated endpoints have an anonymous-request check that verifies the documented authentication error.
- **SC-006**: 100% of endpoints with documented request bodies have at least one invalid-request check that verifies the documented error envelope.
- **SC-007**: 100% of response shape checks identify missing required fields and unexpected enum values.
- **SC-008**: A deliberate route prefix change causes at least one contract test to fail before any later implementation phase can be accepted.
- **SC-009**: The report identifies the endpoint ID and mismatch category for every unexpected failure.
- **SC-010**: 0 frontend files are modified by Phase 3 work.
- **SC-011**: A reviewer can determine from the report whether Phase 4 is blocked by contract drift in under 5 minutes.
- **SC-012**: Future phases can reuse the suite without rewriting endpoint IDs, paths, or response shape expectations.

## Assumptions

- Phase 1 remains the authoritative source for endpoint IDs, methods, paths, request shapes, response shapes, status codes, source citations, and grounding notes.
- Phase 2 has already produced a runnable backend foundation with all 18 routes registered and documented placeholder responses.
- The Phase 2 dispensation allows Phase 3 to proceed against derived endpoint contracts even though the frontend currently issues zero observed HTTP requests.
- Contract tests are expected to fail against unimplemented business behavior, but they must fail in a classified and actionable way.
- Auth credential validation and token issuance remain out of scope until Phase 6; Phase 3 uses the Phase 2 presence-of-credential behavior for protected-route checks.
- Persistent storage is still out of scope for Phase 3; any data setup used by contract tests must not require a durable production data store.
- Frontend changes are out of scope for Phase 3.
