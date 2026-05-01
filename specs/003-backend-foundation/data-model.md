# Data Model — Backend Foundation (Phase 2)

This document describes the structural entities Phase 2 produces. It
is **not** a database schema (Phase 2 has no database — see spec
FR-020 / SC-015). It captures the shape of the *project* the Phase 2
deliverable assembles, so a reviewer can confirm completeness against
the spec's `Key Entities` and validate cross-references in
`/speckit-tasks` and `/speckit-implement`.

Database-level entities (`User`, `Transaction`, `NotificationItem`,
`AuditLogEntry`) are owned by **Phase 5**. Phase 2 references them
only via Phase 1's contract document
(`specs/002-api-discovery/api-contract.md`).

---

## E-001 — Backend Project

The Laravel application produced by Phase 2.

**Attributes**

| Field | Value | Source / Constraint |
|-------|-------|---------------------|
| `php_version` | `^8.3` | `composer.json` `require.php`; spec FR-002 |
| `laravel_version` | `^11.0` | `composer.json` `require.laravel/framework`; spec FR-002 |
| `test_runner` | Pest 3.x | `composer.json` `require-dev.pestphp/pest`; spec FR-010 |
| `app_directory` | `backend/` | New top-level directory; plan §"Project Structure" |
| `routes_file` | `backend/routes/api.php` | Constitution Principle IV |
| `bootstrap_file` | `backend/bootstrap/app.php` | Laravel 11 idiom |
| `api_mount_prefix` | `''` (empty — mounted at `/`) | Spec FR-003; plan §Complexity Tracking row 1 |
| `cors_origin_env` | `CORS_ALLOWED_ORIGINS` | Spec FR-006; default `http://localhost:3000` |
| `request_id_header` | `X-Request-Id` | research.md R-007 |

**Relationships**

- Owns 19 `Stub Endpoint` records (`EP-001..EP-018` + `Health Endpoint`).
- Owns 4 middleware records (CORS, structured request log, bearer
  presence auth, central exception handler).
- Owns 1 `Route Registry Artefact`.
- Owns 1 `Setup Quickstart`.
- Owns 1 smoke test file.

**Validation rules**

- `php_version` and `laravel_version` MUST be pinned in
  `composer.json` (FR-002). CI MUST fail if Composer's platform check
  is bypassed (FR-018).
- `api_mount_prefix` MUST be empty string. A reviewer can confirm by
  running `php artisan route:list --path=transactions` and checking
  that the matched route is exactly `/transactions`, not
  `/api/transactions`.

---

## E-002 — Stub Endpoint

One record per Phase 1 endpoint entry (`EP-001..EP-018`). Phase 2
registers 18 of these. The `Health Endpoint` (E-003) is its own type
because it is not a Phase 1 endpoint.

**Attributes**

| Field | Value / Constraint |
|-------|-------------------|
| `phase1_endpoint_id` | One of `EP-001`..`EP-018` |
| `http_method` | Phase 1 entry's `method` (verbatim) |
| `path` | Phase 1 entry's `path` (verbatim — no prefix; FR-003) |
| `controller_class` | One of `TransactionController`, `AdminTransactionController`, `AuthController` (grouped per plan §"Project Structure") |
| `controller_action` | Method name on the controller class (e.g., `index`, `store`, `cancel`, `confirmMatch`) |
| `auth_requirement` | Inherited from Phase 1 entry (`required` or `none`) |
| `stub_status_code` | `501` — uniform across all 18; research.md R-010 |
| `stub_error_code` | `"not_implemented"` |
| `stub_response_body` | `ErrorEnvelope` shape with `error.details.endpoint_id` set to `phase1_endpoint_id` |

**Relationships**

- Belongs to one `Backend Project` (E-001).
- Maps 1:1 with one row in `Route Registry Artefact` (E-005).
- For entries flagged `auth_requirement: required`, the route MUST
  be registered behind the `auth.bearer.presence` middleware
  alias.

**Validation rules**

- A `Stub Endpoint` entity is **valid** iff: it has a row in the
  route registry, its `http_method`+`path` matches Phase 1 verbatim,
  and `php artisan route:list` confirms its registration.
- The 18 Phase 1 endpoint IDs MUST appear exactly once each across
  the set. SC-002 = "100% coverage, 0 missing".
- A stub controller action MUST NOT contain business logic
  (FR-015 / SC-009). A grep for `Transaction::create`,
  `DB::table`, or `User::find` in `app/Http/Controllers/` MUST
  return zero matches at Phase 2 close.

---

## E-003 — Health Endpoint

The single, unauthenticated, non-Phase-1 endpoint that proves the
foundation is up.

**Attributes**

| Field | Value |
|-------|-------|
| `path` | `/healthz` |
| `method` | `GET` |
| `auth_requirement` | none |
| `response_status` | `200` |
| `response_content_type` | `application/json` |
| `response_body_fields` | `status` (always `"ok"`), `service` (`"salamhack-backend"`), `version` (read from `config('app.version')` mirroring `composer.json`) |

**Relationships**

- Belongs to `Backend Project` (E-001).
- Has its own row in `Route Registry Artefact` (E-005), separate
  from the 18 Phase 1 rows.

**Validation rules**

- MUST respond in under 200 ms on a developer laptop (SC-005).
- MUST NOT require any header beyond the framework defaults.
- A startup precondition MUST cause the server to fail with a
  readable error if any required env var is missing (FR-018, SC-014);
  the health endpoint MUST NOT mask such a failure by returning 200.

---

## E-004 — Error Envelope Renderer

The central component that converts every non-2xx response into the
canonical `ErrorEnvelope` JSON shape.

**Attributes**

| Field | Value |
|-------|-------|
| `location` | Custom callbacks registered in `bootstrap/app.php`'s `withExceptions()` block |
| `envelope_schema` | `specs/002-api-discovery/contracts/entities/ErrorEnvelope.schema.json` (Phase 1 contract) |
| `covered_status_codes` | At least 401, 404, 405, 422, 500. Stub controllers explicitly produce 501 (which the renderer also wraps). |
| `error_code_map` | `NotFoundHttpException → "not_found"`, `MethodNotAllowedHttpException → "method_not_allowed"` (with `Allow` header), `ValidationException → "validation_failed"`, `AuthenticationException → "unauthenticated"`, default uncaught → `"internal_error"`, stub → `"not_implemented"` |
| `request_id_propagation` | Echoes `X-Request-Id` from request to response and into log lines |

**Relationships**

- Belongs to `Backend Project` (E-001).
- Receives every non-2xx exit point from the framework or stub
  controllers.

**Validation rules**

- 0 non-2xx responses bypass the renderer (SC-004). The smoke test
  asserts this for at least the 404 and the 501 paths.
- Production stack traces MUST NOT appear in response bodies; they
  belong only in server-side logs.

---

## E-005 — Route Registry Artefact

The checked-in mapping from each Phase 1 endpoint ID to its Laravel
route registration. Lives at
`specs/003-backend-foundation/contracts/route-registry.md`.

**Attributes**

| Field | Value |
|-------|-------|
| `format` | Markdown table with columns: `EP-ID`, `Method`, `Path`, `Controller@Action`, `Auth`, `Stub Response`, `Phase 1 Source` |
| `row_count` | Exactly 19 (`EP-001..EP-018` + `Health Endpoint`) |
| `verifiable_via` | `php artisan route:list` cross-check; one quickstart command |

**Relationships**

- One row per `Stub Endpoint` (E-002), plus one row for the
  `Health Endpoint` (E-003).

**Validation rules**

- 100% of `EP-001..EP-018` IDs appear exactly once (FR-017, SC-002).
- 0 rows reference a non-existent Phase 1 endpoint ID.
- 0 rows are missing a Phase 1 source citation.

---

## E-006 — Setup Quickstart

The contributor-facing setup document at
`specs/003-backend-foundation/quickstart.md`.

**Attributes**

| Field | Content |
|-------|---------|
| `prerequisites` | PHP ≥ 8.3, Composer ≥ 2.x, Git |
| `install_steps` | `cd backend && composer install` |
| `env_setup` | `cp .env.example .env && php artisan key:generate` |
| `cors_env` | `CORS_ALLOWED_ORIGINS=http://localhost:3000` |
| `run_command` | `php artisan serve --port=8000` |
| `smoke_command` | `vendor/bin/pest --filter=FoundationSmokeTest` |
| `verify_route_registry_command` | `php artisan route:list --json` |

**Validation rules**

- A reviewer following the document MUST reach a passing smoke test
  in under 10 minutes from a fresh clone (SC-001).
- Every command MUST be copy-pasteable; the document MUST NOT
  require out-of-band questions to the author.

---

## E-007 — Authentication Middleware Stub

The middleware that enforces presence-of-credential for endpoints
flagged `auth_requirement: required` in Phase 1.

**Attributes**

| Field | Value |
|-------|-------|
| `class` | `App\Http\Middleware\BearerPresenceAuth` |
| `route_alias` | `auth.bearer.presence` (registered in `bootstrap/app.php`'s `withMiddleware()` callback) |
| `header_checked` | `Authorization` |
| `accepted_format` | `Bearer <non-empty>` (any non-empty string after `Bearer `) |
| `failure_response` | 401, canonical envelope, `error.code: "unauthenticated"` |
| `pass_through_behavior` | Calls `$next($request)` without setting `Auth::user()` (Phase 6 owns user lookup) |

**Relationships**

- Belongs to `Backend Project` (E-001).
- Is applied to every `Stub Endpoint` (E-002) whose
  `auth_requirement` is `required`. By Phase 1 count, that is 16 of
  the 18 endpoints (all except `EP-015 POST /auth/signup` and
  `EP-017 POST /auth/login`, which have `auth_requirement: none`).

**Validation rules**

- 0 endpoints flagged `auth_requirement: required` in Phase 1 are
  registered without this middleware (SC-008).
- The middleware MUST NOT validate token contents (Clarifications
  Q4); a future Phase 6 PR replaces it.

---

## Cross-cutting validation summary

| Spec FR/SC | Entity it constrains | How verified |
|-----------|---------------------|--------------|
| FR-002 / SC-002 | E-001 (versions), E-002 (count) | composer.json + route registry row count |
| FR-003 | E-002 (path verbatim) | route registry + `php artisan route:list` |
| FR-004 / SC-005 | E-003 | smoke test + manual timing |
| FR-005 / SC-003 / SC-004 | E-004 | smoke test (404 + 501) |
| FR-006 / SC-006 | E-001 (CORS env) | smoke test + manual preflight |
| FR-007 | E-001 (FormRequest pattern documented) | quickstart + plan |
| FR-008 / SC-007 | E-001 (logging middleware) | smoke test + log inspection |
| FR-009 / SC-008 | E-007 | smoke test (anonymous + non-empty token cases) |
| FR-010 / SC-013 | E-001 (Pest installed) | `vendor/bin/pest` exits 0 |
| FR-011 | E-002 (`EP-003`/`EP-015` request body shape) | route registry "Stub Response" column |
| FR-012 / FR-013 / SC-012 | plan.md Complexity Tracking | reviewer reads Complexity Tracking |
| FR-014 / SC-010 | n/a (negative constraint) | `git diff main -- frontend/` is empty |
| FR-015 / SC-009 | E-002 (no business logic) | grep for forbidden patterns in controllers |
| FR-016 / SC-011 | plan.md Constitution Check | reviewer reads Constitution Check |
| FR-017 / SC-002 | E-005 | row-count check |
| FR-018 / SC-014 | E-001 (startup preconditions) | manual: delete env var, server fails |
| FR-019 / SC-013 | smoke test file | `vendor/bin/pest` output |
| FR-020 / SC-015 | n/a (negative constraint) | `find backend/database/migrations` is empty |
