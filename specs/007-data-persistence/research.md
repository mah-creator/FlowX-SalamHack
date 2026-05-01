# Research: Phase 5 Data Persistence

## Decision: Use SQLite for Phase 5 persistence

**Rationale**: SQLite was selected during clarification for local/demo and contract-test persistence. It provides real durable relational storage with minimal setup, works well with Laravel migrations and Eloquent, and supports the hackathon/demo workflow without requiring an external database service.

**Alternatives considered**:

- MySQL/MariaDB: closer to common app deployments but adds setup and service-management overhead that is unnecessary for Phase 5.
- PostgreSQL: strong production database choice but outside the local/demo focus of this phase.
- Continue file-backed JSON storage: simpler but conflicts with the Phase 5 objective and the constitution's persistence guidance.

## Decision: Replace the temporary FlowX store behind the existing contract

**Rationale**: The updated frontend contract must not change. The safest implementation is to keep the existing FlowX controller/route surface and replace the backing store with Eloquent/SQLite persistence plus response shapers that preserve Phase 4.5 field names and status values.

**Alternatives considered**:

- Introduce a new persistent API surface: rejected because the frontend contract is authoritative.
- Modify the updated frontend service layer: rejected by the constitution and Phase 4.5 contract-fidelity requirements.
- Keep both JSON and SQLite as active stores: rejected because it increases state drift and makes persistence tests ambiguous.

## Decision: Seed baseline demo data only when missing

**Rationale**: The clarified behavior is "seed once; explicit reset only." This preserves user-created data across restarts and repeated setup commands while still allowing a clean demo baseline when the persistent environment is empty.

**Alternatives considered**:

- Reseed on every startup: rejected because it would overwrite durable user-created state.
- Manual import only: rejected because it slows local setup and makes tests less repeatable.
- Always reset read-mostly resources: rejected because reset should be an explicit developer action.

## Decision: Do not migrate temporary Phase 4.5 runtime data

**Rationale**: Phase 4.5 storage was explicitly temporary and non-durable. Treating it as disposable keeps the Phase 5 migration scope small, avoids encoding unstable JSON-file state into the new schema, and matches the clarified spec.

**Alternatives considered**:

- Best-effort import from `storage/framework/flowx-store.json`: rejected because it creates unpredictable local results and extra edge cases.
- Manual export/import flow: rejected because no business requirement depends on preserving temporary data.

## Decision: FlowX transfers are canonical for overlapping transaction concepts

**Rationale**: The updated FlowX frontend is the primary contract after Phase 4.5. Making FlowX transfers canonical avoids duplicate persistent transfer state and lets legacy Phase 4 transaction behavior adapt through a compatibility mapping.

**Alternatives considered**:

- Separate FlowX and legacy stores: rejected because duplicated state can diverge.
- Legacy transactions canonical: rejected because it would force FlowX fields/statuses to adapt to an older model and risk frontend contract drift.

## Decision: Use Eloquent models, migrations, seeders, and domain services

**Rationale**: The constitution requires Laravel idiomatic architecture for persistence. Eloquent models and migrations make schema reviewable, seeders make baseline data repeatable, and domain services/actions keep controllers thin while preserving lifecycle rules and audit logging.

**Alternatives considered**:

- Raw SQL repositories: rejected because no performance or contract need justifies deviating from Laravel conventions.
- Controller-level persistence logic: rejected because it makes state transitions and multi-record actions harder to test.

## Decision: Keep Phase 6 security and Phase 7 production readiness out of scope

**Rationale**: Phase 5 focuses on data durability and integrity. Existing demo-compatible access behavior remains unless a persistence integrity rule requires validation. Token/session hardening, deployment database selection beyond SQLite, monitoring, and production readiness remain later phases.

**Alternatives considered**:

- Add full auth while adding persistence: rejected because it expands scope and risks breaking the updated frontend before Phase 6.
- Add production deployment/database work now: rejected because Phase 7 owns production readiness.
