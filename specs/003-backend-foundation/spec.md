# Feature Specification: Backend Foundation (Phase 2)

**Feature Branch**: `003-backend-foundation`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "Read BACKEND_PLAN.md and create a specification for the Phase2: Backend Foundation"

## Clarifications

### Session 2026-04-29

- Q: How should the Phase 2 plan dispose of `CR-001` (all 18 endpoints classified `derived` against constitution Principle III)? → A: Proceed under a documented dispensation recorded in the Phase 2 plan's Complexity Tracking. Phase 3 contract tests proceed against the derived spec; the contradiction stays open and visible but does not gate Phase 3.
- Q: How should `CR-003` (ID origin) be resolved for `EP-003 POST /transactions` and `EP-015 POST /auth/signup`? → A: Both server-issued. The server generates the transaction `id` (preserving the `TR-####` format from Phase 1) and an opaque user identifier on signup; request bodies for `EP-003` and `EP-015` do NOT carry an `id` field.
- Q: Should the backend keep Phase 1's unprefixed route paths or introduce a path prefix? → A: Keep Phase 1 paths verbatim (no `/api`, no `/v1`). The Laravel API mount point is reconfigured to `/`; the deviation from Laravel's default `/api` mount is recorded in the Phase 2 plan's Complexity Tracking as a justified Principle IV deviation required by Principle I (frontend defines the contract).
- Q: How should the Phase 2 auth middleware behave when a Bearer token IS present (vs. absent)? → A: Pass through on any non-empty `Authorization: Bearer <anything>` header. Phase 2's auth middleware enforces presence-of-credential only; any non-empty token value is accepted. Real token validation, user lookup, and token issuance are Phase 6 concerns.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — A runnable backend skeleton for every endpoint Phase 1 enumerated (Priority: P1)

A Phase 3 contract-test author opens this repository, follows a documented
setup, and starts a local backend. Without writing any business logic and
without modifying the frontend, every one of the 18 endpoints documented in
`specs/002-api-discovery/api-contract.md` (EP-001 through EP-018) responds at
its documented method+path with a canonical, JSON error envelope and the
correct content type. The author can then sit down to write contract tests in
Phase 3 and run them against this skeleton, with the only assertion-failure
mode being "stub placeholder vs. expected real response" — never "route does
not exist".

**Why this priority**: Phase 3 (Contract Testing) cannot start until every
endpoint Phase 1 enumerated exists at its route. Without P1, contract tests
are written against a vapor backend, blocking the entire downstream pipeline.
P1 because no later phase can responsibly start without it.

**Independent Test**: A reviewer who has never seen the project clones the
repo, runs the documented setup, starts the server, and `curl`s every endpoint
listed in the Phase 1 contract document with its documented HTTP method. Each
request returns a response (no connection error, no framework-default 404)
carrying `Content-Type: application/json` and a body matching the canonical
`ErrorEnvelope` schema from
`specs/002-api-discovery/contracts/entities/ErrorEnvelope.schema.json`.

**Acceptance Scenarios**:

1. **Given** the backend has been started per the setup documentation,
   **When** a reviewer issues an HTTP request to any path EP-001 through
   EP-018 with the documented method, **Then** the server responds (no
   connection error, no framework-default route-not-found page).
2. **Given** any of the 18 endpoints, **When** the server responds to a
   stub request, **Then** the response carries `Content-Type:
   application/json` and a body matching the `ErrorEnvelope` schema from
   Phase 1.
3. **Given** the foundation is in place, **When** a Phase 3 contract test
   author writes a test that asserts the response shape for any endpoint,
   **Then** the route is reachable and the only assertion failure mode is
   the placeholder vs. real-response gap, not "route does not exist".

---

### User Story 2 — Health check confirms the backend is wired correctly (Priority: P2)

An operator (or anyone running the backend locally for the first time) needs
a single endpoint that confirms the backend is running, the framework is
loaded, and the configured environment is healthy enough to accept requests.
They issue an unauthenticated GET request to the health endpoint and receive a
positive response that identifies the running service and its pinned version.

**Why this priority**: A health endpoint is the most basic operational signal.
P2 because P1 depends on the foundation existing and responding, and the
health endpoint is the simplest observable proof the foundation is reachable.
Skipping it leaves no clean signal "the backend is up".

**Independent Test**: From a fresh clone, a reviewer follows the setup, starts
the server, and `curl`s the health endpoint without any auth header. The
response is HTTP 200 with a JSON body containing at minimum a `status` field
equal to `"ok"` and a `version` field equal to the pinned project version.

**Acceptance Scenarios**:

1. **Given** the backend is running, **When** a reviewer issues a GET
   request to the health endpoint without any `Authorization` header,
   **Then** the server responds with HTTP 200 and a JSON body containing
   `status: "ok"`.
2. **Given** the backend is running, **When** a reviewer reads the health
   response, **Then** the body identifies the running service (name +
   pinned version) so operators can confirm what version is up.
3. **Given** the backend is misconfigured (e.g., a required environment
   variable is missing), **When** the server is started, **Then** it
   fails fast with a readable error rather than starting and then
   reporting health failures from a half-booted state.

---

### User Story 3 — Operational guardrails are in place from day one (Priority: P3)

A reviewer auditing the backend's infrastructure layer needs to confirm that
— even before any business logic exists — three operational concerns are
already wired correctly:

- CORS allows the frontend's documented development origin(s) and refuses any
  other origin.
- Every non-2xx response (404 on missing routes, 405 on wrong method, 422 on
  validation failure, 500 on unexpected errors) is rendered through the
  central error envelope, never as the framework's default HTML or text error
  page.
- Request logging captures method, path, status, and duration for every
  request.

**Why this priority**: These three are required by the constitution (CORS is
non-`*`, central exception handler renders the envelope, no ad-hoc errors per
controller). P3 because the foundation works in a strict "endpoints respond"
sense without them, but a Phase 4 implementer or Phase 7 operator inheriting
an environment without them will create drift later that is expensive to undo.

**Independent Test**: A reviewer (a) issues a CORS preflight from a non-frontend
origin and confirms it is denied, (b) requests an unknown path and confirms
the response is the canonical error envelope JSON (not a framework-default
HTML 404), and (c) tails the server log and confirms exactly one structured
log line per request, including method, path, status code, and duration.

**Acceptance Scenarios**:

1. **Given** the server is running, **When** a CORS preflight arrives from
   the frontend's documented dev origin, **Then** it succeeds; **When**
   the same preflight arrives from any other origin, **Then** it is
   rejected. Wildcard `*` is forbidden in any environment other than local
   development.
2. **Given** the server is running, **When** any HTTP request hits a route
   that does not exist, **Then** the response is HTTP 404 with
   `Content-Type: application/json` and a body matching the
   `ErrorEnvelope` schema with `error.code: "not_found"` (not the
   framework's default 404 page).
3. **Given** the server is running, **When** any request is processed,
   **Then** exactly one structured log line is emitted including HTTP
   method, request path, response status code, and request duration.

---

### Edge Cases

- A future amendment to Phase 1 (under constitution Principle V) adds or
  modifies an endpoint after Phase 2 closes. The foundation MUST surface a
  detectable signal — a route-registry diff, a smoke test, or a lint — that
  catches missing route registrations rather than letting drift accumulate
  silently.
- A request body that violates `Content-Type: application/json` (e.g., HTML
  form, malformed JSON) MUST return the canonical error envelope with a stable
  `error.code` rather than a framework-default error page or stack trace.
- A request to a registered path with a wrong method (e.g., GET on a POST-only
  route) MUST return HTTP 405 with the canonical envelope and an `Allow`
  header listing supported methods.
- Phase 2 finishes before authentication is fully implemented in Phase 6.
  Endpoints whose Phase 1 entry has `auth_requirement: required` MUST already
  enforce the absence-of-credential failure mode (HTTP 401 with the
  recommended envelope) so Phase 3 contract tests for the unauthenticated
  case can be written and run against this foundation.
- A misconfigured CORS origin (typo in env var, missing scheme, etc.) MUST
  cause server startup to fail or to log an unmissable warning. It MUST NOT
  silently fall back to `*`.
- A panic or uncaught exception inside any controller stub MUST surface as a
  500 response rendered through the central error envelope, not as a stack
  trace returned to the client.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Phase 2 MUST produce a runnable backend that any contributor can
  start from a fresh clone using documented setup steps. The setup steps MUST
  live inside this feature directory (e.g.,
  `specs/003-backend-foundation/quickstart.md`) and MUST include the exact
  commands required to install dependencies, configure environment, and start
  the server.
- **FR-002**: Phase 2 MUST pin the chosen Laravel major version and PHP
  language version in `composer.json` (`require.php` and
  `require.laravel/framework`) and MUST record the same versions in this
  feature's plan. The choice of major version is a Phase 2 plan decision; the
  spec only requires that it be pinned and recorded.
- **FR-003**: Every endpoint enumerated in
  `specs/002-api-discovery/api-contract.md` (EP-001 through EP-018) MUST be
  registered as a route in the backend with the documented HTTP method and
  path **verbatim** — no `/api` prefix, no `/v1` prefix, no path rewriting.
  The Laravel API mount point MUST be reconfigured so that `routes/api.php`
  is mounted at `/`, and that reconfiguration MUST be recorded in the
  Phase 2 plan's Complexity Tracking as a justified Principle IV deviation
  required by Principle I (frontend defines the contract). Stub
  controllers MUST return a documented placeholder response defined by the
  Phase 2 plan; no business logic is implemented.
- **FR-004**: A health check endpoint MUST exist at a stable path (default
  `GET /healthz`, with the final path recorded in the Phase 2 plan and
  quickstart). The endpoint MUST be reachable without an `Authorization`
  header and MUST return HTTP 200 with `Content-Type: application/json` and a
  body containing at minimum `status`, `service`, and `version` fields.
- **FR-005**: A central exception handler MUST render every non-2xx response
  in the `ErrorEnvelope` shape defined by
  `specs/002-api-discovery/contracts/entities/ErrorEnvelope.schema.json`. No
  controller, middleware, or framework default page may produce a
  non-envelope error response. This includes framework-generated 404, 405,
  422, and 500 responses.
- **FR-006**: CORS middleware MUST be configured to permit the frontend's
  documented development origin(s) explicitly. The Phase 2 plan MUST record
  the origin(s) it permits. Wildcard origins (`*`) MUST NOT be configured in
  any environment other than the local development environment, and the
  origin policy MUST be configurable via environment variable so the same
  image runs in dev, staging, and production without code changes.
- **FR-007**: Request validation infrastructure MUST be scaffolded so that
  endpoints implemented in Phase 4 use centralized validation idiomatic to
  the chosen framework (per constitution Principle IV: `FormRequest` classes)
  rather than inline controller validation. The Phase 2 plan MUST document
  the validation pattern Phase 4 will follow, including how validation
  failures map onto the canonical error envelope.
- **FR-008**: A request logging mechanism MUST emit exactly one structured
  log line per request, capturing at minimum HTTP method, request path,
  response status code, and duration. The log destination MUST be
  configurable per environment (file, stdout, etc.).
- **FR-009**: Authentication middleware MUST be scaffolded according to the
  wire-level scheme recommended in `specs/002-api-discovery/api-contract.md`
  (Bearer token in the `Authorization` header). The middleware enforces
  **presence-of-credential only**:
  - When the `Authorization` header is absent or empty, the middleware
    MUST reject the request with HTTP 401 and the canonical error envelope
    (`error.code: "unauthenticated"`) on every endpoint whose Phase 1
    entry has `auth_requirement: required`.
  - When the `Authorization` header carries a non-empty `Bearer <token>`
    value, the middleware MUST pass the request through to the controller
    regardless of the token's content. Any non-empty token value is
    accepted in Phase 2.
  Phase 2 does NOT implement credential validation, user lookup, token
  issuance, token revocation, or token expiration. Those are Phase 6
  concerns. Phase 3 contract tests for authenticated endpoints MAY use
  any non-empty fixture string as the Bearer token.
- **FR-010**: A test harness MUST be installed and runnable with a single
  documented command. Phase 2 does NOT write the contract tests themselves
  (that is Phase 3), but the harness MUST be capable of executing a smoke
  test that hits the health endpoint and confirms the foundation is wired.
  The choice between PHPUnit and Pest is a Phase 2 plan decision; whichever
  is chosen MUST be pinned in `composer.json` per constitution § Technology
  Stack.
- **FR-011**: Phase 2 resolves `CR-003` (ID origin for transaction creation
  `EP-003` and signup `EP-015`) as **server-issued for both `Transaction`
  and `User`**. Request bodies for `EP-003` and `EP-015` MUST NOT carry an
  `id` field; the server generates the transaction `id` (preserving the
  Phase 1 `TR-####` string format) and an opaque user identifier on
  signup, and returns each in the response body. The Phase 2 plan MUST
  reflect this choice in the route registration and stub response shape
  so Phase 3 tests assert against a definite contract. Stub controllers
  in Phase 2 MAY return a fixed-format placeholder ID matching the chosen
  format (e.g., `"TR-0000"`) without persisting it.
- **FR-012**: The Phase 2 plan MUST dispose of `CR-001` (all 18 endpoints
  classified `derived` against constitution Principle III) by **proceeding
  under a documented dispensation** recorded in the plan's Complexity
  Tracking section, per constitution Governance § "Justified deviations
  MUST be (i) recorded in the Complexity Tracking table … (ii) accompanied
  by written justification … (iii) approved by at least one PR reviewer".
  The dispensation MUST cite Phase 1's audit-method finding (zero observed
  HTTP calls in `frontend/src/`) as its evidence basis, and MUST be
  visible to a Phase 3 reviewer without re-reading Phase 1. Phase 3
  contract tests proceed against the derived spec under this dispensation;
  the contradiction stays open and visible until the frontend is wired or
  the constitution is amended.
- **FR-013**: The Phase 2 plan MUST address `CR-002` (auth endpoints
  `EP-015` through `EP-018` derived from the FR-010(b) auth recommendation,
  not from frontend behavior) with the same disposition options as FR-012.
  The disposition MAY differ from the choice in FR-012, since auth
  endpoints have a different observability story.
- **FR-014**: Phase 2 MUST NOT modify any file under `frontend/`. The
  frontend tree at the time Phase 2 closes MUST be byte-identical to the
  frontend tree at the time Phase 2 opened, with the sole exception of the
  base-URL configuration mechanism if (and only if) such a mechanism already
  exists in the frontend at audit time (per constitution Principle I).
- **FR-015**: Phase 2 MUST NOT implement business logic for any of the 18
  endpoints. Validation rule bodies, authorization checks beyond
  presence-of-credential, persistence, status transitions, and admin
  authorization are explicitly Phase 4+ concerns. Phase 2's deliverable for
  each endpoint is: a registered route, a stub controller, and a documented
  placeholder response — nothing else.
- **FR-016**: The Phase 2 plan MUST include the standard Constitution Check
  confirming the foundation is consistent with the five constitutional
  principles. Any deviation MUST be recorded in the plan's Complexity
  Tracking table with written justification (per constitution Governance).
- **FR-017**: The Phase 2 deliverable MUST include a route-registry artefact
  (e.g., a route list dump from the framework, or a checked-in mapping
  table) inside this feature directory, mapping each Phase 1 endpoint ID
  (EP-001 through EP-018) to the registered route in the backend. A
  reviewer MUST be able to verify FR-003 by reading this artefact alone,
  without running the server.
- **FR-018**: A documented startup precondition MUST cause the server to
  fail fast (non-zero exit, readable message) when a required environment
  variable is missing or malformed (e.g., CORS origin, app key). The server
  MUST NOT silently start with insecure defaults.
- **FR-019**: The Phase 2 deliverable MUST include a smoke test (executed by
  the chosen test harness) that confirms (a) the health endpoint returns
  HTTP 200, (b) at least one stub endpoint returns the canonical error
  envelope, and (c) an unknown path returns the canonical error envelope.
  The smoke test MUST be runnable in CI from a single documented command.
- **FR-020**: The Phase 2 deliverable MUST NOT introduce any database
  schema, migration, or Eloquent model. Database engine selection and
  persistence are explicitly Phase 5 concerns. In-memory or no-op
  persistence is acceptable for stub endpoints, and the contract MUST
  remain unchanged when Phase 5 introduces persistence.

### Key Entities

- **Backend Project**: The Laravel application produced by Phase 2.
  Attributes: pinned PHP version, pinned Laravel version, pinned test
  runner, configured environment variables, route registry, middleware
  stack, central exception handler, smoke test.
- **Stub Endpoint**: One per Phase 1 endpoint entry (EP-001..EP-018).
  Attributes: HTTP method, path, controller class, placeholder response
  shape (uniform across endpoints), mapped Phase 1 endpoint ID,
  auth-requirement marker.
- **Health Endpoint**: A single, unauthenticated, non-Phase-1 endpoint that
  proves the foundation is up. Attributes: stable path, response shape
  containing `status`, `service`, `version`.
- **Error Envelope Renderer**: The central component that converts any
  non-2xx response (framework-generated or controller-thrown) into the
  `ErrorEnvelope` JSON shape. Attributes: covered status codes, mapped
  `error.code` values, log emission per render.
- **Route Registry Artefact**: A checked-in document or auto-generated dump
  inside `specs/003-backend-foundation/` that maps every Phase 1 endpoint
  ID to its registered backend route. Used by reviewers to verify FR-003
  and by Phase 3 to write tests against a stable contract.
- **Setup Quickstart**: The contributor-facing setup document inside this
  feature directory. Attributes: prerequisites, install steps, environment
  variables, run command, smoke test command.
- **Authentication Middleware Stub**: The middleware that enforces
  presence-of-credential for endpoints flagged
  `auth_requirement: required` in Phase 1. Attributes: covered route list,
  expected header (`Authorization: Bearer <token>`), failure response
  (`401` + canonical envelope, `error.code: "unauthenticated"`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer from a fresh clone can start the backend in under
  10 minutes following only the documented setup steps, with no out-of-band
  questions to the original author.
- **SC-002**: 100% of endpoints listed in
  `specs/002-api-discovery/api-contract.md` (EP-001 through EP-018) are
  registered in the backend with the documented method and path. The route
  registry artefact (FR-017) covers all 18 entries. 0 endpoints are missing.
- **SC-003**: 100% of registered stub endpoints respond with `Content-Type:
  application/json` and a body matching the canonical `ErrorEnvelope`
  schema. 0 responses leak framework-default HTML or text.
- **SC-004**: 100% of non-2xx responses produced by the foundation
  (including framework-generated 404 on unknown routes, 405 on wrong
  methods, 422 on validation failures, and 500 on unexpected errors) match
  the canonical `ErrorEnvelope` schema. 0 responses bypass the central
  exception handler.
- **SC-005**: The health endpoint returns HTTP 200 with the documented body
  in under 200 ms on a developer laptop, measured from request issue to
  response receipt over `localhost`.
- **SC-006**: CORS preflight from the documented frontend dev origin
  succeeds; CORS preflight from any other origin is rejected. 0
  environments other than local development are configured with `*`.
- **SC-007**: 100% of incoming requests during a smoke test produce exactly
  one structured log line containing HTTP method, request path, status
  code, and duration. 0 requests produce zero or duplicate log lines.
- **SC-008**: 100% of endpoints with `auth_requirement: required` in
  Phase 1 reject anonymous requests with HTTP 401 and the canonical error
  envelope (`error.code: "unauthenticated"`). 0 such endpoints return any
  other status for an anonymous request at Phase 2 close.
- **SC-009**: 0 endpoints implement business logic (transaction
  creation/cancel/match/payout, signup, login, dispute, admin review). All
  endpoint controllers contain only the stub placeholder behavior
  documented by the plan.
- **SC-010**: 0 files under `frontend/` are modified by Phase 2 work. The
  frontend tree at Phase 2 close is byte-identical to the frontend tree at
  Phase 2 open, with the optional exception of the base-URL configuration
  mechanism if that mechanism already existed at audit time.
- **SC-011**: The Constitution Check in the Phase 2 plan has 0 unjustified
  violations; 100% of justified deviations are recorded in Complexity
  Tracking with written justification and reviewer approval per
  constitution Governance.
- **SC-012**: The Phase 2 plan resolves `CR-003` with a single chosen
  ID-origin position per affected entity, `CR-001` with a single chosen
  disposition, and `CR-002` with a single chosen disposition. 0
  contradictions are left silently unresolved at Phase 2 close.
- **SC-013**: The chosen test harness (PHPUnit or Pest) runs the smoke test
  to completion in under 30 seconds from a single documented command and
  emits at least one passing result confirming the foundation is wired.
- **SC-014**: A misconfigured environment (intentional missing required
  variable) causes the server to refuse to start with a readable error
  message. 0 misconfigurations result in a silent insecure default.
- **SC-015**: 0 database migrations, schemas, or Eloquent models are
  produced by Phase 2. Persistence is deferred entirely to Phase 5, and
  the contract observable through the route registry MUST remain
  unchanged when Phase 5 lands.

## Assumptions

- The chosen backend framework family is Laravel (PHP), as ratified by
  `.specify/memory/constitution.md` (Principles IV and V) and
  `BACKEND_PLAN.md` Phase 2. Phase 2's plan picks the major version, the
  PHP version, and the test runner; this spec is framework-aware but does
  not pre-select those.
- The frontend's documented development origin is `http://localhost:3000`,
  per `frontend/package.json` (`"dev": "vite --port=3000 --host=0.0.0.0"`).
  The Phase 2 plan pins this value as the default of the configurable
  CORS origin variable; the host `0.0.0.0` flag means the dev server is
  reachable on the LAN, so the configurable variable MUST accept a list
  of origins (not a single value).
- Stub endpoints respond with HTTP 501 ("Not Implemented") plus the
  canonical error envelope (`error.code: "not_implemented"`) by default.
  The Phase 2 plan MAY adopt a different placeholder convention, but
  whichever convention is chosen MUST satisfy SC-003 (envelope shape) and
  MUST be uniform across all 18 endpoints. The 501 default is chosen
  because it gives Phase 3 contract tests a clean "fails for the right
  reason" failure mode (status 501 vs. expected 200/201/204).
- The recommended wire-level auth scheme for Phase 6 is Bearer token in
  the `Authorization` header, per FR-010(b) of the Phase 1 spec. Phase 2
  honors that scheme at the middleware level (presence-of-credential
  check) but does not implement credential validation, user lookup, or
  token issuance.
- The route-registry artefact format (Markdown table, JSON, framework
  dump) is a Phase 2 plan choice; the spec only requires that the
  artefact exists, lives under `specs/003-backend-foundation/`, and
  covers all 18 endpoints with their EP-IDs.
- Database engine selection is explicitly out of scope for Phase 2 and is
  deferred to Phase 5. In-memory or no-op persistence is acceptable for
  stub endpoints; the contract MUST NOT change when Phase 5 introduces
  real persistence.
- The `User`, `Transaction`, `NotificationItem`, and `AuditLogEntry`
  Eloquent models and migrations are out of scope for Phase 2; they are
  owned by Phase 5.
- This feature follows the Spec Kit cycle:
  this spec → `/speckit-clarify` (if needed) → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`. Phase 3 (Contract Testing)
  does not start until Phase 2's exit criteria pass (per constitution
  Principle V).
- Phase 2 may be incrementally extended later (constitution Principle V)
  if Phase 1 is amended to add or modify an endpoint. The route-registry
  artefact (FR-017) and the smoke test (FR-019) exist to make such
  amendments visible.
