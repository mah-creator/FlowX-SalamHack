# Phase 0 Research — Backend Foundation (Phase 2)

This document records the plan-time decisions for Phase 2 that the
spec deliberately deferred to the plan, the rationale for each, and
alternatives considered. It resolves the spec's residual ambiguities
without requiring `/speckit-clarify` to be re-run.

The spec at `specs/003-backend-foundation/spec.md` carries 0
`[NEEDS CLARIFICATION]` markers; the four answered clarifications
(Q1 / `CR-001` disposition, Q2 / `CR-003` ID origin, Q3 / path
prefix, Q4 / auth presence semantics) are integrated into the spec's
Clarifications section and reflected in FR-003, FR-009, FR-011,
FR-012. Q5 (stub-response convention) was not asked; the spec's
default Assumption — HTTP 501 + canonical `ErrorEnvelope` — stands and
is locked here.

---

## R-001 — Laravel major version

- **Decision**: Laravel 11.x.
- **Rationale**: Laravel 11 (released March 2024) is the current
  stable major at the time of Phase 2 setup (2026-04-29) and is the
  release the constitution's "latest stable major" language points
  at. Laravel 11 introduced the streamlined `bootstrap/app.php`
  approach which makes the route mount-point deviation (Complexity
  Tracking row 1) a one-block edit instead of a service-provider
  override. PHP support is ≥ 8.2; we pin 8.3.
- **Alternatives considered**:
  - Laravel 10 LTS — older but with longer security support. Rejected
    because the bootstrap-style configuration makes the mount-point
    deviation cleaner in 11, and the LTS support window does not
    matter for a hackathon prototype that will be re-baselined
    before any production deployment.
  - Laravel 12 (if released by audit time) — rejected because as of
    the planning date 11.x is the current stable; we do not pin a
    pre-release. Phase 7 may upgrade.

## R-002 — PHP version

- **Decision**: PHP 8.3.x. `composer.json` pin: `"php": "^8.3"`.
- **Rationale**: Laravel 11 requires PHP ≥ 8.2; 8.3 is the latest
  stable release line as of 2026-04-29, has security support through
  late 2026, and unlocks readonly classes and typed `\Override`
  attributes that we expect Phase 4 to use idiomatically. CI will
  enforce the pin via Composer's platform check.
- **Alternatives considered**:
  - PHP 8.2 — minimum for Laravel 11; rejected because no reason to
    take the lower floor when 8.3 is current and stable.
  - PHP 8.4 — rejected as too new at the time of Phase 2 setup;
    fewer hosting providers ship it by default.

## R-003 — Test runner

- **Decision**: Pest 3.x. `composer.json` pin:
  `"pestphp/pest": "^3.0"`. PHPUnit available transitively as
  Pest's underlying engine.
- **Rationale**: Laravel 11's installer offers Pest as the
  default-suggested runner. Pest's `it('returns 501 …', …)` block
  syntax produces tighter contract-test specs than PHPUnit's
  `testItReturns501` method-naming convention, and the diff in
  test-file size matters at the 18-endpoint scale Phase 3 will
  produce. Pest tests still execute under the same `vendor/bin/phpunit`
  underneath, so CI integrations and IDE runners do not need
  Pest-specific support.
- **Alternatives considered**:
  - PHPUnit alone — a perfectly valid choice; rejected for ergonomics
    only (no functional shortfall).
  - Codeception — rejected; not first-party in Laravel 11 and adds an
    integration surface.

## R-004 — Validation pattern (Phase 4 will consume)

- **Decision**: `FormRequest` classes per endpoint, registered as
  controller method parameter type-hints. `ValidationException` is
  caught by the central exception handler and rendered as
  `ErrorEnvelope` with `error.code: "validation_failed"` and a
  `details` object carrying field-level errors.
- **Rationale**: Constitution Principle IV mandates `FormRequest`
  validation. Mapping `ValidationException` (HTTP 422 by Laravel
  default) into the canonical envelope shape (FR-005, SC-004) is one
  branch in the central exception handler — the only Phase 2 work is
  to write that branch and add a `tests/Feature/FoundationSmokeTest`
  case asserting it. Phase 4 will define per-endpoint rule arrays;
  Phase 2 only ships the bridge.
- **Alternatives considered**:
  - Inline `Validator::make()` calls in controllers — rejected by
    constitution Principle IV.
  - Spatie's data-transfer-object package — rejected as out-of-stack
    addition with no Phase 2 benefit; can be revisited in Phase 4 if
    needed.

## R-005 — Response shaping pattern (Phase 4 will consume)

- **Decision**: API Resources (`Illuminate\Http\Resources\Json\JsonResource`
  and `ResourceCollection`) per endpoint family. Phase 2 ships the
  pattern documentation in `quickstart.md` and produces zero
  Resource classes (no business logic). Phase 4 implements them.
- **Rationale**: Constitution Principle IV mandates Resource-based
  response shaping. Documenting the pattern at Phase 2 time keeps
  Phase 4's response shapes reviewable in one place per endpoint.
- **Alternatives considered**:
  - Hand-rolled array returns — rejected by Principle IV.
  - Fractal — rejected; redundant with Laravel's built-in Resources.

## R-006 — Central exception handler / error envelope renderer

- **Decision**: Customize the exception handler registered in
  `bootstrap/app.php`'s `withExceptions()` callback to render the
  `ErrorEnvelope` shape from
  `specs/002-api-discovery/contracts/entities/ErrorEnvelope.schema.json`
  for every JSON-accepting request. Map common Laravel exceptions:
  - `NotFoundHttpException` → 404, `error.code: "not_found"`.
  - `MethodNotAllowedHttpException` → 405, `error.code: "method_not_allowed"`,
    `Allow` header populated.
  - `ValidationException` → 422, `error.code: "validation_failed"`,
    `error.details` carries field errors.
  - `AuthenticationException` (none-credential) → 401,
    `error.code: "unauthenticated"` (FR-009).
  - All other uncaught exceptions → 500, `error.code: "internal_error"`,
    no stack trace in the response body (logged server-side instead).
- **Rationale**: Laravel 11's `bootstrap/app.php` consolidates the
  exception handler registration; one block here covers SC-004
  (every non-2xx renders the envelope). The mappings from
  Laravel-default exceptions to envelope `error.code` strings are
  fixed in one place and easy to audit.
- **Alternatives considered**:
  - Override individual `register()` methods on the legacy
    `App\Exceptions\Handler` — rejected because Laravel 11 deprecates
    that file in favor of `bootstrap/app.php`.

## R-007 — Logging shape

- **Decision**: One JSON-line per request, written to stdout in
  development and to `storage/logs/laravel.log` (still JSON-formatted)
  in higher environments. Fields: `timestamp`, `method`, `path`,
  `status`, `duration_ms`, `request_id` (UUID v4 generated on entry,
  also returned to the client as `X-Request-Id`). Implementation:
  one custom `StructuredRequestLog` middleware registered globally
  via `bootstrap/app.php`'s `withMiddleware()` callback. Laravel's
  default Monolog stack handles JSON formatting.
- **Rationale**: FR-008 requires "method, path, status code,
  duration"; SC-007 requires exactly one line per request.
  JSON-line is operations-friendly (greppable, parseable) and is the
  Laravel default for production. The `X-Request-Id` propagation
  costs nothing in Phase 2 and pays off in Phase 7.
- **Alternatives considered**:
  - Plain-text Apache combined-log format — rejected; harder to
    parse in any later observability stack.
  - Per-controller logging — rejected; can't satisfy SC-007's
    "exactly one line per request" without an HTTP-layer middleware.

## R-008 — CORS configuration

- **Decision**: Laravel's built-in `HandleCors` middleware (no
  external package). Configuration in `config/cors.php` driven by a
  `CORS_ALLOWED_ORIGINS` env var that is comma-separated (a list,
  per spec). Default is `http://localhost:3000` (the frontend's
  documented dev origin per `frontend/package.json`'s
  `"dev": "vite --port=3000 --host=0.0.0.0"`). `paths` is `*` (all
  routes covered). `allowed_methods` matches the union of methods
  used in Phase 1 entries (`GET`, `POST`, `OPTIONS`).
  `allowed_headers` includes `Authorization`, `Content-Type`,
  `Accept`, `X-Request-Id`. `supports_credentials` is `false` per
  the bearer-token scheme (the frontend will not need cookies).
- **Rationale**: Laravel 11 ships `HandleCors` first-party — no need
  for `fruitcake/laravel-cors` or another external dependency.
  Comma-separated env-driven origins satisfy SC-006 (configurable,
  not `*`) and the spec's amended assumption that the variable
  accepts a list.
- **Alternatives considered**:
  - Wildcard `*` origin — explicitly forbidden by spec FR-006 / SC-006
    outside local development.
  - `fruitcake/laravel-cors` package — superseded by Laravel's
    built-in handler in Laravel 9+.

## R-009 — Authentication middleware (Phase 2 stub; Phase 6 implements)

- **Decision**: A custom `BearerPresenceAuth` middleware placed in
  `app/Http/Middleware/`, registered as a route middleware alias
  `auth.bearer.presence` in `bootstrap/app.php`. The middleware:
  - Returns the canonical 401 envelope (`error.code:
    "unauthenticated"`) when the `Authorization` header is missing
    or empty or not in the form `Bearer <non-empty-string>`.
  - Calls `$next($request)` when the header is present and
    well-formed.
  - Does NOT validate token contents, look up users, or set
    `Auth::user()`. Phase 6 will replace this middleware with
    Sanctum or Passport-driven middleware.
- **Auth package preview (Phase 6 only — recorded for handoff)**:
  Bearer-token via Sanctum is the leading candidate (lightweight,
  matches the wire-level recommendation in
  `specs/002-api-discovery/api-contract.md`). Passport is rejected as
  overkill (full OAuth2 server) for this product. The decision is
  formally Phase 6's; this note is informational.
- **Rationale**: Spec Clarifications Q4 chose presence-of-credential
  semantics for Phase 2. A 30-line custom middleware is cheaper than
  pulling in Sanctum stubs that we will not exercise. Phase 6 swaps
  middleware (one-line route definition change).
- **Alternatives considered**:
  - Install Sanctum now in pass-through mode — rejected; introduces
    user-table/migration footprint that the spec forbids in Phase 2
    (FR-020, SC-015).
  - Always-401 — rejected by Clarifications Q4 (would block Phase 3
    happy-path tests).

## R-010 — Stub-response convention (Q5 default locked)

- **Decision**: HTTP 501 + canonical `ErrorEnvelope` with
  `error.code: "not_implemented"`. Uniform across all 18 endpoints.
  Stub controllers return:

  ```json
  {
    "error": {
      "code": "not_implemented",
      "message": "This endpoint is registered but not yet implemented (Phase 2 stub).",
      "details": {
        "endpoint_id": "EP-XXX"
      }
    }
  }
  ```

  with `Content-Type: application/json` and HTTP status 501.
  `details.endpoint_id` carries the Phase 1 ID so a Phase 3 reviewer
  can map a failing test back to the contract entry instantly.
- **Rationale**: 501 is the IETF-defined code for "server does not
  support this functionality" — exactly what a stub is. Status
  mismatch (501 vs. expected 200/201/204) gives Phase 3 a clean,
  unambiguous failure mode. Reusing the error envelope makes SC-003
  and SC-004 hold trivially.
- **Alternatives considered**:
  - HTTP 200 with skeleton body — rejected because mixing
    success-status-with-failure-body confuses Phase 3 assertion
    modes.
  - HTTP 503 — rejected because it implies transient unavailability,
    which would imply retry semantics we do not want clients to
    adopt.

## R-011 — Health endpoint shape

- **Decision**: `GET /healthz`, unauthenticated, returns HTTP 200
  with `Content-Type: application/json` and body:

  ```json
  {
    "status": "ok",
    "service": "salamhack-backend",
    "version": "0.1.0"
  }
  ```

  `version` is read from `composer.json` `version` (or a
  `config('app.version')` mirror). Path is `/healthz` (Kubernetes
  convention; non-clashing with any Phase 1 route).
- **Rationale**: FR-004 requires `status`, `service`, `version`
  fields. `/healthz` is a widely-recognized health-probe convention
  that does not collide with the 18 Phase 1 paths and is unlikely to
  collide with any future Phase 1 amendment.
- **Alternatives considered**:
  - `/health` — equivalent; `/healthz` is the more common
    Kubernetes / cloud-native idiom.
  - `/api/health` — rejected; we mount `/api` at `/`, so a `/health`
    behind it would be `/health` anyway, and using `/healthz` keeps
    health probes lexically distinct from product endpoints.

## R-012 — Smoke test scope

- **Decision**: One Pest test file `tests/Feature/FoundationSmokeTest.php`
  with these `it(…)` blocks:
  - `it('returns 200 ok from the health endpoint')`
  - `it('returns 501 with the not_implemented envelope from EP-001')`
    (one stub endpoint exemplar; the rest are Phase 3's contract-test
    territory)
  - `it('returns the canonical not_found envelope on an unknown path')`
  - `it('returns 401 unauthenticated when an authenticated endpoint is hit anonymously')` (against `EP-001`)
  - `it('passes the auth middleware when any non-empty Bearer token is present')` (against `EP-001`)
- **Rationale**: FR-019 requires the smoke test to confirm
  health + at least one stub envelope + unknown-path envelope.
  Adding the two auth-stance assertions costs almost nothing and
  pins Clarifications Q4's behavior so a future regression is loud.
- **Alternatives considered**:
  - Single test combining all assertions — rejected for diagnostic
    clarity; per-block isolation is Pest's idiom.
  - Defer auth assertions to Phase 3 — rejected because Phase 2's
    auth posture is now a contract (Q4) and Phase 2 is the natural
    place to lock it.

## R-013 — Route registry artefact format

- **Decision**: A Markdown table at
  `specs/003-backend-foundation/contracts/route-registry.md`. Columns:
  `EP-ID`, `Method`, `Path`, `Controller@Action`, `Auth`, `Stub
  Response`, `Phase 1 Source`. One row per Phase 1 endpoint. A
  separate row block lists `/healthz` (the only non-Phase-1
  endpoint).
- **Rationale**: Markdown is reviewable in PR diffs without tooling,
  and the same format mirrors Phase 1's entity tables. The columns
  make FR-017 verifiable in one read: a reviewer scans the `EP-ID`
  column and confirms 18 unique IDs are present, then spot-checks any
  row against Phase 1's `api-contract.md`.
- **Alternatives considered**:
  - JSON file — machine-readable but harder to skim in PRs.
  - Auto-generated from `php artisan route:list` — useful as a
    cross-check (and the quickstart documents that command), but
    not as the canonical artefact since route:list output is
    framework-formatted prose, not a stable schema.

---

## Open items for downstream phases

These items are **not** Phase 2's concern but are recorded here so
they are not lost:

- **Phase 3**: Write contract tests grounded in Phase 1's
  `api-contract.md` for every `EP-001` through `EP-018`. The
  `phase3_grounding_note` on each Phase 1 entry is the source.
- **Phase 4**: Implement `FormRequest` classes, API Resources, and
  controller action bodies. Resolve the per-endpoint validation
  rules and response shapes against contract tests.
- **Phase 5**: Introduce database engine (decision deferred), Eloquent
  models (`User`, `Transaction`, `NotificationItem`,
  `AuditLogEntry`), migrations, and seeders. The route registry MUST
  be unchanged (spec SC-015).
- **Phase 6**: Replace `BearerPresenceAuth` middleware with
  Sanctum-driven auth. Wire `EP-015..EP-018`. Remove the `CR-001`
  / `CR-002` dispensation if the constitution amendment is taken
  by then; otherwise, the dispensation continues until the frontend
  is wired.
- **Phase 7**: Production readiness (Docker image, env templates,
  uptime probes, log shipping).
