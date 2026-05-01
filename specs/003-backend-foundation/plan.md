# Implementation Plan: Backend Foundation (Phase 2)

**Branch**: `003-backend-foundation` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-backend-foundation/spec.md`

## Summary

Phase 2 produces a runnable Laravel skeleton at the new top-level
`backend/` directory. Every one of the 18 endpoints documented in
`specs/002-api-discovery/api-contract.md` (`EP-001` through `EP-018`) is
registered at its literal Phase 1 path (no `/api` prefix, no `/v1`
prefix) and returns the canonical stub response — HTTP 501 with the
`ErrorEnvelope` body and `error.code: "not_implemented"`. A single
unauthenticated `GET /healthz` endpoint proves the foundation is up.
A central exception handler renders every non-2xx response (framework
404, 405, 422, 500) through the same envelope. A CORS middleware
permits the frontend's documented origin (`http://localhost:3000` from
`frontend/package.json`) and is configurable via env. A bearer-token
auth middleware enforces presence-of-credential only — non-empty
`Authorization: Bearer …` passes; absent/empty rejects with 401. Pest
is bootstrapped as the test harness with one smoke test that exercises
the health endpoint and one stub endpoint. No business logic, no
persistence, and no frontend changes.

The plan resolves all three Phase 1 contradictions per the spec's
clarifications:

- `CR-001` (all 18 endpoints derived against Principle III) →
  documented dispensation in Complexity Tracking, citing Phase 1's
  zero-observed-traffic finding at audit commit `6f29646`.
- `CR-002` (auth endpoints derived from the FR-010(b) recommendation)
  → same dispensation pattern.
- `CR-003` (ID origin for `EP-003` and `EP-015`) → server-issued for
  both `Transaction` and `User`. Stub controllers return a fixed
  `"TR-0000"` placeholder for transactions and an opaque
  `"usr-0000"` placeholder for users.

The single Laravel deviation — reconfiguring `routes/api.php` to mount
at `/` instead of the framework default `/api` — is required by
constitution Principle I (frontend defines contract; Phase 1 paths
are unprefixed) and is recorded in Complexity Tracking below per
Principle IV.

## Technical Context

**Language/Version**: PHP 8.3.x (current stable; pinned via
`composer.json` `require.php: "^8.3"` and verified in CI).
**Primary Dependencies**: Laravel 11.x (latest stable major as of
2026-04-29; pinned via `composer.json`
`require.laravel/framework: "^11.0"`). No additional first-party HTTP
client, ORM, or queueing dependency is added in Phase 2; Phase 5 may
add `doctrine/dbal` or similar for migrations.
**Storage**: N/A in Phase 2. Stub controllers are stateless and
return fixed placeholder responses. Database engine selection is
deferred to Phase 5; the contract observable through the route
registry MUST remain unchanged when persistence lands (spec FR-020 /
SC-015).
**Testing**: Pest 3.x (built on PHPUnit; Laravel 11's default
installer-offered runner). Chosen for readability of contract-test
specs Phase 3 will write (`it('returns 501 with not_implemented', …)`)
and because Laravel 11 ships first-class scaffolding for it. PHPUnit
remains available transitively. Pinned via `composer.json`
`require-dev.pestphp/pest: "^3.0"`.
**Target Platform**: Linux/macOS server with PHP 8.3+, served by
`php artisan serve` for local development and any standard
PHP-FPM/Nginx (or Caddy) deployment for higher environments.
Production deployment is Phase 7's concern; Phase 2 stops at "runs
on a developer laptop and in CI".
**Project Type**: Web service backend, alongside the existing React
frontend in `frontend/`. New top-level `backend/` directory holds
the Laravel application.
**Performance Goals**: Health endpoint cold-start response < 200 ms on
a developer laptop (spec SC-005). Stub endpoint response < 50 ms
warm. No further latency targets in Phase 2.
**Constraints**:

- MUST NOT modify any file under `frontend/` (constitution Principle I;
  spec FR-014, SC-010).
- All 18 Phase 1 paths registered verbatim — no `/api`, no `/v1`
  (spec FR-003, Clarifications Q3).
- Every non-2xx response goes through the central error envelope
  (spec FR-005, SC-004).
- CORS origin policy is configurable via env, never `*` outside local
  dev (spec FR-006, SC-006).
- No business logic in Phase 2 (spec FR-015, SC-009).
- No database migrations or Eloquent models in Phase 2 (spec FR-020,
  SC-015).
- Auth middleware is presence-of-credential only — Phase 2 does NOT
  validate token contents (spec FR-009, Clarifications Q4).

**Scale/Scope**: 18 stub endpoints + 1 health endpoint = 19 total
routes. Approximately 6 controller classes (grouped by Phase 1's
operation families: Transactions, AdminTransactions, Auth,
TransactionDeposits, TransactionDisputes, Health). Approximately 4
custom middleware (CORS via Laravel built-in; envelope renderer in
exception handler; presence-of-credential auth; structured request
log). One smoke test file covering health + one stub endpoint + 404
envelope behavior.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution at `.specify/memory/constitution.md` v1.0.1 defines
five principles. Applied to this feature:

| # | Principle | Applicability | Status |
|---|-----------|---------------|--------|
| I | Frontend-Contract Fidelity (NON-NEGOTIABLE) | Direct — every Phase 1 endpoint is registered at its literal path; CORS allows the frontend's documented origin only; the Bearer-token auth shape matches FR-010(b). No frontend changes. The Laravel mount-point reconfiguration to `/` exists *because of* this principle. | ✅ Pass |
| II | Test-First Development (NON-NEGOTIABLE) | Direct — the Pest smoke test (FR-019) is authored before stub controllers per Phase 2's task ordering, and `/speckit-tasks` will enforce test-task placement. Phase 3 will own the actual contract tests; Phase 2's gate is "harness exists and a smoke test passes". | ✅ Pass |
| III | Contract Tests From Observed Frontend Behavior | Indirect — Phase 2 does not write contract tests, but it ships the harness Phase 3 will use. `CR-001` is the visible contradiction (all 18 endpoints derived); resolution is documented dispensation per spec Clarifications Q1 and FR-012. | ✅ Pass with justified deviation (see Complexity Tracking) |
| IV | Laravel Idiomatic Architecture | Direct — `routes/api.php` for routing; controllers thin; central exception handler renders envelope; FormRequest scaffolding documented for Phase 4 to consume; API Resources documented for Phase 4. **One deviation**: API mount point reconfigured from `/api` to `/`, required by Principle I. | ✅ Pass with justified deviation (see Complexity Tracking) |
| V | Spec-Driven Phased Delivery | Direct — this feature *is* the Phase 2 cycle. Phase 3 starts only after Phase 2's exit criteria pass. The route-registry artefact (FR-017) and smoke test (FR-019) make any later Phase 1 amendment visible. | ✅ Pass |

**Initial gate**: PASS with two justified deviations recorded below.

**Post-design re-check**: see end of Phase 1 below.

## Project Structure

### Documentation (this feature)

```text
specs/003-backend-foundation/
├── spec.md                     # Specification (clarified by /speckit-clarify)
├── plan.md                     # This file (/speckit-plan)
├── research.md                 # Phase 0 output (/speckit-plan)
├── data-model.md               # Phase 1 output (/speckit-plan)
├── quickstart.md               # Phase 1 output (/speckit-plan)
├── checklists/
│   └── requirements.md         # Spec quality checklist
├── contracts/
│   └── route-registry.md       # Maps EP-001..EP-018 to Laravel routes (FR-017)
└── tasks.md                    # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
backend/                        # NEW — created in /speckit-implement
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── HealthController.php           # GET /healthz
│   │   │   ├── TransactionController.php      # EP-001..EP-008, EP-010
│   │   │   ├── AdminTransactionController.php # EP-009, EP-011..EP-014
│   │   │   └── AuthController.php             # EP-015..EP-018
│   │   └── Middleware/
│   │       ├── BearerPresenceAuth.php         # FR-009 (presence-only)
│   │       └── StructuredRequestLog.php       # FR-008
│   └── Exceptions/
│       └── EnvelopeRenderer.php               # FR-005 (central handler)
├── bootstrap/
│   └── app.php                                # API mount → '/' (Principle IV deviation)
├── config/
│   └── cors.php                               # FR-006 (env-driven origin allowlist)
├── routes/
│   └── api.php                                # All 18 Phase 1 routes verbatim + healthz
├── tests/
│   └── Feature/
│       └── FoundationSmokeTest.php            # FR-019
├── composer.json                              # Pins PHP, Laravel, Pest
├── .env.example                               # CORS_ALLOWED_ORIGINS, APP_KEY, etc.
└── README.md                                  # Points at quickstart.md

frontend/                       # UNCHANGED — Principle I
└── (no edits)

CLAUDE.md                       # EDITED — pointer updated to this plan
```

**Structure Decision**: A new top-level `backend/` directory is created
for the Laravel app. This keeps the existing `frontend/` directory
untouched and gives operators a clear `frontend` / `backend` split.
The Laravel app is a standard `composer create-project laravel/laravel`
layout with the customizations enumerated above. The CORS package is
Laravel's built-in `HandleCors` middleware (no external CORS
dependency); `bootstrap/app.php` (Laravel 11's central bootstrap file)
hosts the route mount-point reconfiguration and middleware
registration.

## Complexity Tracking

> Filled because two justified deviations exist. Both are recorded
> here with written justification per constitution Governance §
> "Justified deviations MUST be (i) recorded in the Complexity
> Tracking table … (ii) accompanied by written justification …
> (iii) approved by at least one PR reviewer".

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Laravel API routes mounted at `/` instead of the framework default `/api` (Principle IV deviation) | Constitution Principle I (NON-NEGOTIABLE) requires the backend to honor Phase 1's literal contract; Phase 1 paths are unprefixed (e.g., `/transactions`, `/auth/signup`). Adding an `/api` prefix would silently amend the contract. The reconfiguration is mechanical — one block in `bootstrap/app.php`'s `withRouting()` call setting `apiPrefix: ''`. | Adding `/api` prefix to all routes would amend the Phase 1 contract and require a Phase 1 changelog entry plus implicit frontend base-URL configuration discipline. Principle I's NON-NEGOTIABLE status outranks Principle IV's idiomatic-architecture preference, and Principle IV explicitly permits "deviations … required to satisfy Principle I". |
| Phase 3 contract tests proceed against derived endpoint specs (Principle III dispensation; resolves `CR-001`, `CR-002`) | At Phase 1 audit commit `6f29646`, the React frontend issues zero observed HTTP requests in `frontend/src/`; the entire 18-endpoint surface is derived from `DemoContextValue` methods, page flows, and entity shapes. Gating Phase 3 contract testing on a frontend HTTP rewrite would stall the hackathon timeline; raising a constitution amendment cycle is slower still. The dispensation is bounded: each endpoint's `phase3_grounding_note` (Phase 1 deliverable) records how the test will be re-grounded once the frontend is wired. | Gating Phase 3 on a frontend wiring sprint stalls every later phase; amending the constitution is the orthogonal long-form path and was rejected for time. The dispensation is documented and visible, not silent. |

Both deviations require at least one PR reviewer approval per
constitution Governance § (d) and (iii). The Phase 2 implementation
PR will carry these justifications in its description and link back
to this section.

---

## Phase 0: Outline & Research

**Status**: Complete — spec contains 0 `[NEEDS CLARIFICATION]` markers
(four resolved by `/speckit-clarify` session 2026-04-29; one — stub
response convention — deferred and locked to the spec's existing
default of HTTP 501 + canonical envelope, recorded in
[research.md](./research.md)). Remaining plan-level decisions
(Laravel major version, PHP version, test runner, validation pattern,
auth package preview for Phase 6, logging shape, CORS package, health
endpoint shape) are recorded in [research.md](./research.md).

Output: [research.md](./research.md). It records the plan-time
decisions that shape this feature's deliverable, the rationale for
each, and alternatives considered.

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete (yes).

1. **Entities → data-model.md**: The spec defines seven structural
   entities for the Phase 2 deliverable (Backend Project, Stub
   Endpoint, Health Endpoint, Error Envelope Renderer, Route Registry
   Artefact, Setup Quickstart, Authentication Middleware Stub). These
   describe the *project* Phase 2 produces, not a database. (Database
   models are Phase 5.) Captured in
   [data-model.md](./data-model.md) with attributes, relationships,
   and validation rules derived from the spec's functional
   requirements. The `Stub Endpoint` entity carries a per-instance
   record for each `EP-001` through `EP-018` mapping.

2. **Interface contracts → contracts/**: PRESENT. The Phase 2
   contract is the **route registry** — a checked-in mapping from
   each Phase 1 endpoint ID to its Laravel route registration (FR-017,
   SC-002). Lives at
   [contracts/route-registry.md](./contracts/route-registry.md).
   `/speckit-implement` later cross-checks this artefact against
   `php artisan route:list` output to catch drift. The Phase 2
   contract does NOT include OpenAPI re-derivation — Phase 1's
   `specs/002-api-discovery/contracts/openapi.yaml` (when produced) is
   the upstream contract; Phase 2 only registers it.

3. **Quickstart → quickstart.md**: A reviewer-oriented walkthrough
   covering: prerequisites (PHP 8.3+, Composer 2.x), setup commands
   (`composer install`, `cp .env.example .env`, `php artisan key:generate`),
   running the server (`php artisan serve --port=8000`), running the
   smoke test (`vendor/bin/pest --filter=FoundationSmokeTest`), and
   spot-checking the route registry against
   `php artisan route:list`. See
   [quickstart.md](./quickstart.md).

4. **Agent context update**: The plan reference in `CLAUDE.md` between
   `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` is updated to
   point at this plan (`specs/003-backend-foundation/plan.md`). The
   constitution-precedence note remains intact.

**Output**: research.md, data-model.md, contracts/route-registry.md,
quickstart.md, updated CLAUDE.md plan pointer.

### Constitution Check (post-design re-evaluation)

After Phase 1 design, no new violations introduced beyond the two
already recorded in Complexity Tracking:

- Principle I: design preserves Phase 1 paths verbatim, CORS origin
  is the frontend's documented dev origin, no `frontend/` edits. ✅
- Principle II: data-model and quickstart both describe a smoke test
  that runs before any stub controller is implemented; task ordering
  in `/speckit-tasks` will enforce test-first. ✅
- Principle III: dispensation for `CR-001`/`CR-002` is documented
  above; no new contradiction introduced. ✅
- Principle IV: design uses Laravel idioms (`bootstrap/app.php`,
  `routes/api.php`, FormRequest scaffolding, central exception
  handler); the one mount-point deviation is the only one. ✅
- Principle V: design fits within the Phase 2 envelope — no business
  logic, no persistence. ✅

**Post-design gate**: PASS with the two justified deviations recorded
above.
