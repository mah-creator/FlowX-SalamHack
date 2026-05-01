# Implementation Plan: Phase 5 Data Persistence

**Branch**: `007-data-persistence` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-data-persistence/spec.md`

## Summary

Phase 5 replaces the temporary FlowX JSON/file store with durable SQLite-backed persistence while preserving the Phase 4.5 FlowX frontend contract and existing Phase 4 compatibility behavior. The implementation approach is to introduce Eloquent models, migrations, seeders, and persistence services for FlowX resources, make FlowX transfers the canonical transfer-like record, and adapt legacy transaction behavior where concepts overlap.

The updated frontend remains unchanged. Baseline demo data is seeded only when missing, explicit reset behavior is available for local demos/tests, and temporary Phase 4.5 runtime data is not migrated.

## Technical Context

**Language/Version**: PHP 8.3.x, pinned by `backend/composer.json` as `require.php: "^8.3"`.

**Primary Dependencies**: Laravel 11.x, Eloquent ORM, Pest 3.x, Laravel Pint. No new runtime package is planned.

**Storage**: SQLite for local/demo and contract-test persistence. Migrations define persistent FlowX tables; seeders initialize the baseline dataset only when missing. Temporary `backend/storage/framework/flowx-store.json` data is disposable and not migrated.

**Testing**: Pest 3.x with Laravel `TestCase` and database refresh/migration helpers. Contract tests remain derived from `updated_frontend/` service call sites and Phase 4.5 contracts; new persistence tests verify restart-style durability through separate app/store lifecycles.

**Target Platform**: Local Laravel API server for the updated React/Vite frontend. The updated frontend defaults to `http://localhost:5000`, so quickstart continues to run `php artisan serve --host=127.0.0.1 --port=5000`.

**Project Type**: Web-service backend in `backend/`, integrated with an existing React frontend in `updated_frontend/`. No frontend source changes are allowed.

**Performance Goals**:

- User and admin dashboard resource loads respond in under 250 ms p95 on a developer laptop using SQLite.
- FlowX contract and persistence tests run deterministically without network dependency.
- Demo initialization from an empty SQLite database completes in under 30 seconds.
- Demo user transfer workflow and admin review workflow remain completable from the updated frontend in under 3 minutes.

**Constraints**:

- MUST preserve the Phase 4.5 FlowX resource contract: paths, methods, filters, body shapes, response shapes, statuses, and error behavior.
- MUST use SQLite for Phase 5 local/demo and contract-test persistence.
- MUST use Eloquent models and migrations per the constitution.
- MUST seed baseline demo data only when missing and avoid overwriting user-created persisted data unless an explicit reset workflow is run.
- MUST NOT migrate temporary Phase 4.5 runtime data.
- MUST keep existing Phase 4 `/transactions`, `/admin/transactions`, and `/auth/*` behavior from regressing.
- MUST make FlowX transfers the canonical persisted representation for transfer-like data where FlowX and legacy behavior overlap.
- MUST keep ordinary FlowX resource PATCH behavior mock-compatible and partial.
- MUST enforce valid transitions on dedicated action routes.
- MUST NOT introduce Phase 6 authentication/security hardening.
- MUST return arrays for collection reads, including empty arrays for unmatched filters.

**Scale/Scope**:

- 13 FlowX resource collections: users, transfers, wallets, verifications, disputes, notifications, audit logs, config, agents, payment methods, analytics, activities, and requests.
- 7 mutable resource families: users, wallets, transfers, verifications, notifications, disputes, config.
- 6 create-capable resource families plus audit logs.
- 5 dedicated transfer/admin action routes.
- Existing Phase 4 transaction/auth compatibility surface remains in scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicability | Status |
|-----------|---------------|--------|
| I. Frontend-Contract Fidelity | Direct. The Phase 4.5 FlowX contract and updated frontend remain the source of truth; no frontend code changes are planned. | PASS |
| II. Test-First Development | Direct. Persistence contract/feature tests must be written before replacing the temporary store. | PASS |
| III. Contract Tests Derived From Observed Frontend Behavior | Direct. Existing FlowX contract tests remain derived from updated frontend call sites; new persistence tests wrap those same behaviors with restart/reload checks. | PASS |
| IV. Laravel Idiomatic Architecture | Direct. Phase 5 introduces Eloquent models, migrations, seeders, resources/response shapers, thin controllers, and services/actions for workflow logic. | PASS |
| V. Spec-Driven Phased Delivery | Direct. This is the Phase 5 Spec Kit cycle and explicitly defers full auth/security to Phase 6 and production readiness to Phase 7. | PASS |

**Initial gate**: PASS. No constitution violations are planned.

## Project Structure

### Documentation (this feature)

```text
specs/007-data-persistence/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- flowx-persistence-contract.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md                    # Created by /speckit-tasks, not by this command
```

### Source Code (repository root)

```text
backend/
|-- routes/
|   `-- api.php                  # Preserve FlowX and Phase 4 route surfaces
|-- app/
|   |-- Models/                  # Eloquent models for FlowX persistent resources
|   |-- Domain/
|   |   |-- FlowX/               # Persistence-backed store/services, lifecycle actions, audit logging
|   |   `-- Transactions/        # Legacy compatibility adapts to canonical FlowX transfers where overlapping
|   |-- Http/
|   |   |-- Controllers/
|   |   |   |-- FlowX/           # Controllers keep existing Phase 4.5 response contract
|   |   |   |-- TransactionController.php
|   |   |   `-- AdminTransactionController.php
|   |   |-- Requests/
|   |   |   `-- FlowX/           # Validation for create/patch/action flows
|   |   `-- Resources/
|   |       `-- FlowX/           # Response shapers for exact frontend fields
|   `-- Providers/
|       `-- DomainServiceProvider.php
|-- database/
|   |-- migrations/              # SQLite-compatible FlowX schema
|   |-- seeders/                 # Idempotent baseline seeders and explicit reset support
|   `-- factories/               # Test factories where helpful
|-- storage/framework/           # Existing temporary FlowX files become legacy/disposable
`-- tests/
    |-- Feature/
    |   |-- FlowX/Contract/      # Existing contract tests continue to pass
    |   |-- FlowX/Persistence/   # New restart, seed, reset, and relationship tests
    |   `-- Admin/               # Legacy compatibility tests continue to pass
    `-- Unit/
        `-- Domain/FlowX/        # Persistence service and lifecycle unit tests

updated_frontend/                # Read-only contract source
|-- src/services/
|-- src/features/auth/services/
|-- src/flowx/
`-- db.json
```

**Structure Decision**: Phase 5 stays inside the existing Laravel backend. It replaces the implementation behind the FlowX resource layer with Eloquent/SQLite persistence while preserving controllers/routes from the frontend's perspective. Frontend files remain read-only.

## Complexity Tracking

No constitution violations are introduced.

Using SQLite is the clarified Phase 5 storage decision and fits the constitution's requirement that the database engine be selected in Phase 5. The legacy transaction compatibility layer is required by the Phase 5 spec and Phase 4.5 compatibility commitments; it does not add a new API surface.

## Phase 0: Outline & Research

**Status**: Complete.

All spec clarification markers were resolved before planning. The main plan-time decisions are captured in [research.md](./research.md):

- SQLite is the Phase 5 database engine for local/demo and contract-test persistence.
- Eloquent models and migrations replace the temporary FlowX store.
- Baseline demo data is seeded only when missing; explicit reset is separate.
- Temporary Phase 4.5 runtime data is not migrated.
- FlowX transfers are canonical for transfer-like persistence; legacy behavior adapts where concepts overlap.
- Phase 6 auth/security and Phase 7 production readiness remain out of scope.

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete.

1. **Data model**: [data-model.md](./data-model.md) defines persistent FlowX entities, relationships, uniqueness, idempotent seeding rules, and transfer lifecycle rules.
2. **Contracts**: [contracts/flowx-persistence-contract.md](./contracts/flowx-persistence-contract.md) documents persistence behavior that must hold while preserving the Phase 4.5 HTTP contract.
3. **Quickstart**: [quickstart.md](./quickstart.md) describes SQLite setup, migrations, idempotent seeding, explicit reset, backend/frontend run steps, and persistence smoke tests.
4. **Agent context**: [AGENTS.md](../../AGENTS.md) now points contributors to this Phase 5 plan between the Spec Kit markers.

### Constitution Check (post-design re-evaluation)

| Principle | Re-check Result |
|-----------|-----------------|
| I. Frontend-Contract Fidelity | PASS. Contracts preserve the existing frontend-visible FlowX shapes and route behavior. |
| II. Test-First Development | PASS. Task generation must order persistence and compatibility tests before implementation changes. |
| III. Observed Frontend Behavior | PASS. FlowX HTTP contract remains sourced from `updated_frontend/`; persistence tests validate the same observed behaviors across durable storage. |
| IV. Laravel Idiomatic Architecture | PASS. Design uses Eloquent models, migrations, seeders, FormRequests, response shapers, thin controllers, and domain services/actions. |
| V. Spec-Driven Phased Delivery | PASS. Phase 5 is planned independently and leaves auth/security and production readiness to later phases. |

**Post-design gate**: PASS with no violations.
