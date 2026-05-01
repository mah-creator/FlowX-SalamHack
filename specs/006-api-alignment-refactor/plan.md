# Implementation Plan: Phase 4.5 API Alignment & Refactor

**Branch**: `006-api-alignment-refactor` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-api-alignment-refactor/spec.md`

## Summary

Phase 4.5 aligns the Laravel backend with the updated FlowX frontend in `updated_frontend/`. The updated frontend's resource-style JSON-server contract is the primary contract: `/users`, `/transfers`, `/wallets`, `/verifications`, `/disputes`, `/notifications`, `/auditLogs`, `/config`, `/agents`, `/paymentMethods`, `/analytics`, `/activities`, and `/requests` must work without frontend service changes or authorization headers. Existing Phase 4 transaction/auth routes remain available for backwards compatibility.

The implementation approach is to add a FlowX resource API layer inside the existing Laravel app, backed by a temporary seeded FlowX store initialized from the shapes in `updated_frontend/db.json`. Generic resource reads, creates, and PATCH updates remain mock-compatible, while dedicated transfer/admin action routes enforce valid lifecycle transitions and emit audit logs.

## Technical Context

**Language/Version**: PHP 8.3.x, pinned by `backend/composer.json` as `require.php: "^8.3"`.

**Primary Dependencies**: Laravel 11.x, Pest 3.x, Laravel Pint. No new runtime dependency is planned for Phase 4.5.

**Storage**: Temporary seeded FlowX store, resettable and non-durable. It may be in-memory or file-backed under `backend/storage/framework` only to keep local `php artisan serve` requests coherent across the demo session. No database, Eloquent migration, or Phase 5 persistence behavior is introduced.

**Testing**: Pest 3.x. Contract tests must be derived from `updated_frontend/src/services/*.ts`, `updated_frontend/src/features/auth/services/authApi.ts`, `updated_frontend/src/flowx/WorkspacePages.tsx`, and `updated_frontend/db.json`. Existing Phase 4 tests remain in the suite.

**Target Platform**: Local Laravel API server for the updated React/Vite frontend. The updated frontend defaults to `http://localhost:5000`, so the quickstart runs `php artisan serve --host=127.0.0.1 --port=5000`.

**Project Type**: Web-service backend in `backend/`, integrated with an existing React frontend in `updated_frontend/`. No frontend source changes are allowed.

**Performance Goals**:

- User and admin dashboard resource loads respond in under 200 ms p95 on a developer laptop using the temporary store.
- Contract and feature tests run with deterministic seeded data and no network dependency.
- Demo user transfer workflow and admin review workflow can be completed from the updated frontend in under 3 minutes.

**Constraints**:

- MUST preserve the exact resource-style routes and request/response shapes used by `updated_frontend`.
- MUST NOT require authorization headers for Phase 4.5 resource calls.
- MUST keep existing Phase 4 `/transactions`, `/admin/transactions`, and `/auth/*` endpoints from breaking.
- MUST keep ordinary resource PATCH behavior mock-compatible and partial.
- MUST enforce valid transitions on dedicated action routes such as `/transfers/{id}/submit`, `/match-request`, `/risk-approval`, `/risk-rejection`, and `/refund`.
- MUST NOT introduce durable persistence, migrations, or production auth hardening.
- MUST return arrays for collection reads, including empty arrays for unmatched filters.

**Scale/Scope**:

- 13 resource collections from the updated frontend contract.
- 7 mutable resource families: users, wallets, transfers, verifications, notifications, disputes, config.
- 6 create-capable resource families: users, wallets, transfers, verifications, notifications, disputes, plus audit logs.
- 5 dedicated transfer/admin action routes.
- Existing Phase 4 transaction API remains in place as compatibility surface.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicability | Status |
|-----------|---------------|--------|
| I. Frontend-Contract Fidelity | Direct. `updated_frontend/` is the source of truth. No service, route, header, or shape changes are planned in frontend code. | PASS |
| II. Test-First Development | Direct. Contract tests for the updated frontend resource calls are required before implementing matching routes. | PASS |
| III. Contract Tests Derived From Observed Frontend Behavior | Direct. Tests must reference updated frontend service files or `WorkspacePages.tsx` call sites and seeded `db.json` shapes. | PASS |
| IV. Laravel Idiomatic Architecture | Direct. New behavior belongs in explicit routes, FormRequests for non-trivial writes/actions, Resource or explicit response shapers, thin controllers, and domain/services for store and state transitions. | PASS |
| V. Spec-Driven Phased Delivery | Direct. This feature is the Phase 4.5 Spec Kit cycle and explicitly defers persistence to Phase 5 and full auth/security to Phase 6. | PASS |

**Initial gate**: PASS. The only planned deviation-like choice is temporary non-Eloquent storage, which is expressly permitted before Phase 5 by the constitution's Technology Stack section.

## Project Structure

### Documentation (this feature)

```text
specs/006-api-alignment-refactor/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- flowx-resource-contract.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md                    # Created by /speckit-tasks, not by this command
```

### Source Code (repository root)

```text
backend/
|-- routes/
|   `-- api.php                  # Add FlowX resource routes; preserve Phase 4 routes
|-- app/
|   |-- Domain/
|   |   |-- FlowX/               # New temporary store, seed data, lifecycle actions
|   |   `-- Transactions/        # Existing Phase 4 transaction domain remains
|   |-- Http/
|   |   |-- Controllers/
|   |   |   |-- FlowX/           # Resource and action controllers for updated frontend
|   |   |   |-- TransactionController.php
|   |   |   `-- AdminTransactionController.php
|   |   |-- Requests/
|   |   |   `-- FlowX/           # Create/patch/action FormRequests where useful
|   |   `-- Resources/
|   |       `-- FlowX/           # Response shapers for FlowX resources
|   |-- Support/
|   |   `-- ErrorEnvelope.php    # Reuse/extend existing centralized error format
|   `-- Providers/
|       `-- AppServiceProvider.php or DomainServiceProvider.php
|-- storage/framework/           # Optional temporary demo-store JSON file
`-- tests/
    |-- Feature/
    |   |-- FlowX/Contract/      # Updated frontend derived contract tests
    |   `-- FlowX/Actions/       # Lifecycle/action edge cases
    `-- Unit/
        `-- Domain/FlowX/        # Store and state-machine tests

updated_frontend/                # Read-only contract source for Phase 4.5
|-- src/services/
|-- src/features/auth/services/
|-- src/flowx/
`-- db.json
```

**Structure Decision**: Phase 4.5 stays inside the existing Laravel backend. It adds a FlowX resource layer beside, not instead of, the Phase 4 transaction layer. The backend adapts to `updated_frontend`; frontend files remain read-only.

## Complexity Tracking

No constitution violations are introduced.

The temporary store is not a deviation because the constitution permits in-memory or file-backed storage before Phase 5. Keeping Phase 4 routes while adding FlowX resource routes is required by the Phase 4.5 spec and does not add a new project or API gateway.

## Phase 0: Outline & Research

**Status**: Complete.

All spec clarification markers were resolved before planning. The main plan-time decisions are captured in [research.md](./research.md):

- `updated_frontend/` service files and `db.json` are authoritative for Phase 4.5.
- FlowX resource routes are added without removing Phase 4 routes.
- Generic PATCH remains permissive; dedicated action routes enforce lifecycle transitions.
- Demo-compatible resource calls remain header-free.
- Temporary seeded storage remains pre-Phase-5 only.

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete.

1. **Data model**: [data-model.md](./data-model.md) captures FlowXUser, FlowXTransfer, Wallet, Verification, Dispute, Notification, Config, AuditLog, Agent, PaymentMethod, AnalyticsMetric, Activity, and Request resources, plus validation and state-transition rules.
2. **Contracts**: [contracts/flowx-resource-contract.md](./contracts/flowx-resource-contract.md) documents every updated frontend HTTP call, query filter, body shape, response shape, and expected status behavior used by Phase 4.5 tests.
3. **Quickstart**: [quickstart.md](./quickstart.md) describes running Laravel on port 5000, pointing the updated frontend at it, and manually exercising user/admin workflows.
4. **Agent context**: [AGENTS.md](../../AGENTS.md) now points contributors to this Phase 4.5 plan between the Spec Kit markers.

### Constitution Check (post-design re-evaluation)

| Principle | Re-check Result |
|-----------|-----------------|
| I. Frontend-Contract Fidelity | PASS. Contracts are copied from updated frontend call sites; frontend remains unchanged. |
| II. Test-First Development | PASS. Task generation must order FlowX contract tests before implementation. |
| III. Observed Frontend Behavior | PASS. Each contract group has a source path in `updated_frontend/`. |
| IV. Laravel Idiomatic Architecture | PASS. Design uses explicit routes/controllers/FormRequests/resources/domain services; no catch-all resource proxy. |
| V. Spec-Driven Phased Delivery | PASS. Persistence and full authorization remain out of scope for later phases. |

**Post-design gate**: PASS with no violations.
