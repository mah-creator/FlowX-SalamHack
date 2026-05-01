# Tasks: Backend Foundation (Phase 2)

**Input**: Design documents from `C:\Users\mahmoud\Desktop\salam hack\salamhack prototype\specs\003-backend-foundation\`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/route-registry.md`, `quickstart.md`
**Tests**: Required. The constitution and FR-019 require test-first delivery with a Pest smoke test before controller implementation.
**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its phase dependencies are complete because it touches different files and does not depend on incomplete tasks.
- **[Story]**: User-story label for story-phase tasks only.
- Every task includes an exact target path.

## Path Conventions

- Backend app: `backend/`
- Feature docs: `specs/003-backend-foundation/`
- Phase 1 upstream contract: `specs/002-api-discovery/api-contract.md`
- Do not edit any file under `frontend/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Laravel backend skeleton, pin versions, and remove default persistence artifacts that are out of scope for Phase 2.

- [X] T001 Create the Laravel 11 application by running `composer create-project laravel/laravel backend` from repository root, producing `backend/composer.json`
- [X] T002 Pin PHP to `^8.3`, Laravel framework to `^11.0`, Pest to `^3.0`, and project version to `0.1.0` in `backend/composer.json`
- [X] T003 [P] Configure backend environment defaults, including `APP_NAME=salamhack-backend`, `APP_ENV=local`, `APP_DEBUG=true`, `APP_URL=http://localhost:8000`, `APP_VERSION=0.1.0`, `CORS_ALLOWED_ORIGINS=http://localhost:3000`, and log channel defaults in `backend/.env.example`
- [X] T004 [P] Create a backend README that points contributors to the feature quickstart and route registry in `backend/README.md`
- [X] T005 Remove default Laravel persistence artifacts so Phase 2 has no database schema or Eloquent model, including `backend/app/Models/User.php` and all default files under `backend/database/migrations/`
- [X] T006 [P] Add `APP_VERSION` support by exposing `version => env('APP_VERSION', '0.1.0')` in `backend/config/app.php`
- [X] T007 [P] Confirm the root `.gitignore` excludes Laravel local/runtime files from `backend/.env`, `backend/vendor/`, `backend/storage/*.key`, and `backend/bootstrap/cache/*.php` in `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared route mounting, envelope rendering, middleware registration, CORS configuration, and test harness wiring that all stories depend on.

**CRITICAL**: No user story implementation should start until this phase is complete.

- [X] T008 Configure Laravel API routes to mount at `/` with no `/api` prefix and load `backend/routes/api.php` in `backend/bootstrap/app.php`
- [X] T009 Create reusable error-envelope response helpers for `not_implemented`, `not_found`, `method_not_allowed`, `validation_failed`, `unauthenticated`, and `internal_error` responses in `backend/app/Support/ErrorEnvelope.php`
- [X] T010 Register central exception rendering for 401, 404, 405, 422, 500, and JSON fallback behavior using `App\Support\ErrorEnvelope` in `backend/bootstrap/app.php`
- [X] T011 [P] Configure CORS to read a comma-separated `CORS_ALLOWED_ORIGINS` env var, allow `GET`, `POST`, and `OPTIONS`, allow `Authorization`, `Content-Type`, `Accept`, and `X-Request-Id`, and reject wildcard origins outside local development in `backend/config/cors.php`
- [X] T012 [P] Create startup configuration validation that fails fast on missing or malformed `APP_KEY` and malformed `CORS_ALLOWED_ORIGINS` in `backend/app/Providers/AppServiceProvider.php`
- [X] T013 [P] Implement bearer-token presence-only middleware that accepts any non-empty `Authorization: Bearer <token>` header and returns the canonical 401 envelope otherwise in `backend/app/Http/Middleware/BearerPresenceAuth.php`
- [X] T014 [P] Implement structured request logging middleware that emits exactly one JSON-style log line per request with method, path, status, duration_ms, and request_id in `backend/app/Http/Middleware/StructuredRequestLog.php`
- [X] T015 Register middleware aliases/global middleware for `auth.bearer.presence`, structured request logging, and CORS in `backend/bootstrap/app.php`
- [X] T016 [P] Document the Phase 4 validation and response-shaping pattern, including FormRequest to `validation_failed` envelope and API Resource use, in `backend/README.md`
- [X] T017 [P] Configure Pest/Laravel test bootstrap so feature tests can call backend routes without a running server in `backend/tests/Pest.php`

**Checkpoint**: Laravel app exists, shared bootstrap is configured, and user-story test files can be added.

---

## Phase 3: User Story 1 - Runnable Skeleton for All Phase 1 Endpoints (Priority: P1) MVP

**Goal**: Every `EP-001` through `EP-018` route from Phase 1 is registered verbatim, with no `/api` or `/v1` prefix, and returns a canonical `501 not_implemented` envelope when authenticated routes receive any non-empty Bearer token.

**Independent Test**: From `backend/`, run `vendor/bin/pest --filter=FoundationSmokeTest`; then verify `php artisan route:list --json` contains all 18 Phase 1 routes and no `api/` routes.

### Tests for User Story 1

> Write these tests first and confirm they fail before implementing controllers/routes.

- [X] T018 [P] [US1] Create a Pest smoke test asserting `GET /transactions` without auth returns HTTP 401 with `error.code=unauthenticated` in `backend/tests/Feature/FoundationSmokeTest.php`
- [X] T019 [P] [US1] Add a Pest smoke test asserting `GET /transactions` with `Authorization: Bearer testtoken` returns HTTP 501 with `error.code=not_implemented` and `error.details.endpoint_id=EP-001` in `backend/tests/Feature/FoundationSmokeTest.php`
- [X] T020 [P] [US1] Add a Pest route registry test that asserts the 18 Phase 1 method/path pairs are registered without an `api/` prefix in `backend/tests/Feature/RouteRegistryTest.php`
- [X] T021 [P] [US1] Add a Pest auth-coverage test that asserts all authenticated Phase 1 routes reject missing Bearer tokens with HTTP 401 in `backend/tests/Feature/AuthPresenceMiddlewareTest.php`

### Implementation for User Story 1

- [X] T022 [P] [US1] Create a shared controller helper method that returns `ErrorEnvelope::notImplemented($endpointId)` in `backend/app/Http/Controllers/Concerns/ReturnsNotImplemented.php`
- [X] T023 [P] [US1] Implement `TransactionController` stub actions `index`, `show`, `store`, `cancel`, `confirmMatch`, `confirmDeposit`, `processPayouts`, `openDispute`, and `autoMatch` with endpoint IDs `EP-001` through `EP-008` and `EP-010` in `backend/app/Http/Controllers/TransactionController.php`
- [X] T024 [P] [US1] Implement `AdminTransactionController` stub actions `index`, `flagRisk`, `approve`, `refund`, and `resolveDispute` with endpoint IDs `EP-009` and `EP-011` through `EP-014` in `backend/app/Http/Controllers/AdminTransactionController.php`
- [X] T025 [P] [US1] Implement `AuthController` stub actions `signup`, `verify`, `login`, and `logout` with endpoint IDs `EP-015` through `EP-018` in `backend/app/Http/Controllers/AuthController.php`
- [X] T026 [US1] Register transaction routes for `EP-001` through `EP-008` and `EP-010` behind `auth.bearer.presence` in `backend/routes/api.php`
- [X] T027 [US1] Register admin transaction routes for `EP-009` and `EP-011` through `EP-014` behind `auth.bearer.presence` in `backend/routes/api.php`
- [X] T028 [US1] Register auth routes so `EP-015 POST /auth/signup` and `EP-017 POST /auth/login` are public while `EP-016 POST /auth/verify` and `EP-018 POST /auth/logout` use `auth.bearer.presence` in `backend/routes/api.php`
- [X] T029 [US1] Update the checked-in route registry status from plan-time skeleton to implementation-verified and keep all 18 Phase 1 rows unchanged in `specs/003-backend-foundation/contracts/route-registry.md`
- [X] T030 [US1] Run `vendor/bin/pest --filter="FoundationSmokeTest|RouteRegistryTest|AuthPresenceMiddlewareTest"` from `backend/` and fix failures in `backend/routes/api.php` or `backend/app/Http/Controllers/`

**Checkpoint**: User Story 1 is complete when all 18 routes exist, authenticated routes reject anonymous requests, Bearer-present requests reach the 501 stub, and no route has an `/api` prefix.

---

## Phase 4: User Story 2 - Health Check Confirms Backend Wiring (Priority: P2)

**Goal**: `GET /healthz` is public and returns HTTP 200 JSON with `status`, `service`, and `version`.

**Independent Test**: From `backend/`, run `vendor/bin/pest --filter=FoundationSmokeTest` and manually `curl http://localhost:8000/healthz` after starting `php artisan serve --port=8000`.

### Tests for User Story 2

- [X] T031 [P] [US2] Add a Pest smoke test asserting unauthenticated `GET /healthz` returns HTTP 200, JSON `status=ok`, `service=salamhack-backend`, and `version=0.1.0` in `backend/tests/Feature/FoundationSmokeTest.php`
- [X] T032 [P] [US2] Add a route test asserting `GET /healthz` is registered and is not behind `auth.bearer.presence` middleware in `backend/tests/Feature/HealthEndpointTest.php`

### Implementation for User Story 2

- [X] T033 [P] [US2] Implement `HealthController@show` to return `{status:"ok", service:"salamhack-backend", version:config("app.version")}` in `backend/app/Http/Controllers/HealthController.php`
- [X] T034 [US2] Register public `GET /healthz` route mapped to `HealthController@show` in `backend/routes/api.php`
- [X] T035 [US2] Add the non-Phase-1 health route verification note with implementation status in `specs/003-backend-foundation/contracts/route-registry.md`
- [X] T036 [US2] Run `vendor/bin/pest --filter="FoundationSmokeTest|HealthEndpointTest"` from `backend/` and fix failures in `backend/app/Http/Controllers/HealthController.php` or `backend/routes/api.php`

**Checkpoint**: User Story 2 is complete when `/healthz` works without auth and reports the pinned service version.

---

## Phase 5: User Story 3 - Operational Guardrails From Day One (Priority: P3)

**Goal**: CORS, central error envelopes, validation failure envelopes, request logging, and startup preconditions are wired before any business logic exists.

**Independent Test**: From `backend/`, run the guardrail Pest tests, manually preflight CORS from allowed and denied origins, and inspect one structured log line per request.

### Tests for User Story 3

- [X] T037 [P] [US3] Add a Pest smoke test asserting `GET /this/does/not/exist` returns HTTP 404 JSON with `error.code=not_found` in `backend/tests/Feature/FoundationSmokeTest.php`
- [X] T038 [P] [US3] Add a Pest test asserting a wrong method on a registered route returns HTTP 405 JSON with `error.code=method_not_allowed` and an `Allow` header in `backend/tests/Feature/ErrorEnvelopeTest.php`
- [X] T039 [P] [US3] Add a Pest test route and FormRequest fixture asserting validation failures render HTTP 422 JSON with `error.code=validation_failed` in `backend/tests/Feature/ErrorEnvelopeTest.php`
- [X] T040 [P] [US3] Add a Pest test asserting uncaught exceptions render HTTP 500 JSON with `error.code=internal_error` and no stack trace in `backend/tests/Feature/ErrorEnvelopeTest.php`
- [X] T041 [P] [US3] Add CORS tests for allowed origin `http://localhost:3000`, denied origin `http://evil.example`, and wildcard rejection outside local development in `backend/tests/Feature/CorsConfigurationTest.php`
- [X] T042 [P] [US3] Add request logging test that asserts one log event contains method, path, status, duration_ms, and request_id in `backend/tests/Feature/StructuredRequestLogTest.php`
- [X] T043 [P] [US3] Add startup precondition tests for malformed `CORS_ALLOWED_ORIGINS` and missing `APP_KEY` behavior in `backend/tests/Feature/StartupPreconditionTest.php`

### Implementation for User Story 3

- [X] T044 [US3] Complete central exception mappings and response headers for 404, 405, 422, 500, and request-id propagation in `backend/bootstrap/app.php`
- [X] T045 [US3] Ensure `ErrorEnvelope` returns exactly the canonical `{error:{code,message,details}}` shape for all guardrail errors in `backend/app/Support/ErrorEnvelope.php`
- [X] T046 [US3] Complete CORS allowed-origin parsing, allowed methods, allowed headers, and wildcard safeguards in `backend/config/cors.php`
- [X] T047 [US3] Complete structured request logging, duration measurement, request-id generation, and response `X-Request-Id` propagation in `backend/app/Http/Middleware/StructuredRequestLog.php`
- [X] T048 [US3] Complete startup precondition checks and readable failure messages for missing `APP_KEY` and malformed CORS origin values in `backend/app/Providers/AppServiceProvider.php`
- [X] T049 [US3] Run `vendor/bin/pest --filter="ErrorEnvelopeTest|CorsConfigurationTest|StructuredRequestLogTest|StartupPreconditionTest|FoundationSmokeTest"` from `backend/` and fix failures in guardrail files under `backend/app/`, `backend/bootstrap/`, or `backend/config/`

**Checkpoint**: User Story 3 is complete when non-2xx responses never leak Laravel HTML/text defaults, CORS is explicit, logs emit once per request, and malformed environment config fails loudly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation alignment, and negative-scope checks.

- [X] T050 [P] Verify quickstart commands are accurate for `composer install`, `.env` creation, `php artisan key:generate`, `php artisan serve --port=8000`, and `vendor/bin/pest --filter=FoundationSmokeTest` in `specs/003-backend-foundation/quickstart.md`
- [X] T051 [P] Add a final no-frontend-change verification command and expected empty result to `specs/003-backend-foundation/quickstart.md`
- [X] T052 [P] Add a no-persistence verification command proving no Eloquent models or migrations exist in `backend/app/Models/` and `backend/database/migrations/` to `specs/003-backend-foundation/quickstart.md`
- [X] T053 Run `composer validate` from `backend/` and fix metadata issues in `backend/composer.json`
- [X] T054 Run `vendor/bin/pest` from `backend/` and fix any failing Phase 2 tests in `backend/tests/Feature/`
- [X] T055 Run `php artisan route:list --json` from `backend/` and verify the output has exactly 18 Phase 1 routes, one `healthz` route, and zero `api/`-prefixed routes against `specs/003-backend-foundation/contracts/route-registry.md`
- [X] T056 Confirm no Phase 2 business logic or persistence calls exist by searching for `DB::`, `Transaction::`, `User::`, `Schema::create`, and `Model` usage in `backend/app/Http/Controllers/` and documenting the clean result in `specs/003-backend-foundation/quickstart.md`
- [X] T057 Confirm `git diff -- frontend/` is empty and do not modify any file under `frontend/`
- [X] T058 Update `specs/003-backend-foundation/tasks.md` by checking off only the tasks actually completed during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; starts immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP and highest priority.
- **User Story 2 (Phase 4)**: Depends on Foundational; can run in parallel with User Story 1 after route/bootstrap patterns exist, but sequential delivery after US1 is recommended.
- **User Story 3 (Phase 5)**: Depends on Foundational; can run in parallel with US1/US2 tests, but final guardrail behavior should be validated after routes exist.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories. Provides the MVP route skeleton required for Phase 3 contract testing.
- **US2 (P2)**: No dependency on US1 business behavior. Shares route/bootstrap infrastructure only.
- **US3 (P3)**: No dependency on US1/US2 implementation details, but its tests use registered routes as fixtures.

### Within Each User Story

- Tests must be written before implementation and should fail for the expected missing behavior.
- Shared helper/controller concern before controller actions.
- Controller actions before route registration where route tests depend on the action class existing.
- Route registration before route-list verification.
- Story checkpoint validation before moving to the next priority if implementing sequentially.

---

## Parallel Opportunities

- T003, T004, T006, and T007 can run in parallel after T001.
- T011, T012, T013, T014, T016, and T017 can run in parallel after T008 through T010 are understood.
- US1 tests T018 through T021 can be written in parallel because they touch separate test concerns.
- US1 controllers T023 through T025 can be implemented in parallel after T022.
- US2 tests T031 and T032 can be written in parallel, and T033 can be implemented independently before T034.
- US3 tests T037 through T043 can be written in parallel because each targets a separate guardrail file.
- Polish documentation tasks T050 through T052 can run in parallel after all story behavior is stable.

---

## Parallel Example: User Story 1

```text
Task: "T018 [US1] Create a Pest smoke test asserting GET /transactions without auth returns HTTP 401..."
Task: "T020 [US1] Add a Pest route registry test that asserts the 18 Phase 1 method/path pairs..."
Task: "T021 [US1] Add a Pest auth-coverage test that asserts all authenticated Phase 1 routes reject missing Bearer tokens..."
```

```text
Task: "T023 [US1] Implement TransactionController stub actions..."
Task: "T024 [US1] Implement AdminTransactionController stub actions..."
Task: "T025 [US1] Implement AuthController stub actions..."
```

## Parallel Example: User Story 2

```text
Task: "T031 [US2] Add a Pest smoke test asserting unauthenticated GET /healthz returns HTTP 200..."
Task: "T032 [US2] Add a route test asserting GET /healthz is registered..."
Task: "T033 [US2] Implement HealthController@show..."
```

## Parallel Example: User Story 3

```text
Task: "T038 [US3] Add a Pest test asserting a wrong method on a registered route returns HTTP 405..."
Task: "T041 [US3] Add CORS tests for allowed origin, denied origin, and wildcard rejection..."
Task: "T042 [US3] Add request logging test that asserts one log event contains method, path, status, duration_ms, and request_id..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete Phase 3 User Story 1.
4. Stop and validate all 18 Phase 1 routes with Pest and `php artisan route:list --json`.
5. Confirm no `frontend/` files changed and no database/model artifacts remain.

### Incremental Delivery

1. Setup and Foundational create the Laravel skeleton and shared guardrail hooks.
2. US1 adds the full stub route surface for Phase 3 contract-test authors.
3. US2 adds the operational health signal.
4. US3 hardens errors, CORS, logging, validation failure handling, and startup preconditions.
5. Polish verifies docs, route registry, no-persistence scope, and no frontend edits.

### Lower-Cost LLM Execution Notes

- Work tasks in numeric order unless a task is explicitly marked `[P]`.
- Never edit `frontend/`.
- Do not add database migrations, seeders, factories, or Eloquent models.
- Do not implement transaction, auth, admin, payout, dispute, matching, or persistence business logic.
- Stub endpoint success means HTTP 501 with canonical error envelope, not HTTP 200.
- Auth middleware validates only presence and `Bearer <non-empty>` format; it must not inspect token content.
- Keep Phase 1 paths exact: `/transactions`, not `/api/transactions`.

