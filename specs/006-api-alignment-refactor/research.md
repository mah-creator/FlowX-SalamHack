# Phase 0 Research: API Alignment & Refactor

## R-001: Contract Source

**Decision**: Treat `updated_frontend/` as the Phase 4.5 source of truth. The authoritative sources are:

- `updated_frontend/src/services/apiClient.ts`
- `updated_frontend/src/services/*.service.ts`
- `updated_frontend/src/features/auth/services/authApi.ts`
- `updated_frontend/src/flowx/WorkspacePages.tsx`
- `updated_frontend/db.json`

**Rationale**: The frontend sends JSON-server-style resource requests directly. Any backend route cleanup would require frontend service changes, which the spec explicitly forbids.

**Alternatives Rejected**:

- Reuse Phase 4 `/transactions` routes only: rejected because updated frontend calls `/transfers` and resource collections.
- Add a frontend adapter: rejected by constitution and clarification answers.

## R-002: Resource API Strategy

**Decision**: Add explicit FlowX resource routes beside existing Phase 4 routes. The backend will serve `/users`, `/transfers`, `/wallets`, `/verifications`, `/disputes`, `/notifications`, `/auditLogs`, `/config`, `/agents`, `/paymentMethods`, `/analytics`, `/activities`, and `/requests`.

**Rationale**: This preserves Phase 4 behavior for existing consumers while making the updated FlowX resource contract primary for Phase 4.5.

**Alternatives Rejected**:

- Rename Phase 4 domain routes: rejected because it would risk regressions.
- Catch-all JSON-server proxy route: rejected because Laravel routes must be explicit and reviewable.

## R-003: Storage

**Decision**: Use a temporary seeded FlowX store. It may be process-local in memory or file-backed under `backend/storage/framework` for local demo continuity across requests.

**Rationale**: Phase 4.5 must not introduce durable persistence. The updated frontend needs state to survive between create/update calls during a single local demo session.

**Alternatives Rejected**:

- Database migrations and Eloquent models: rejected as Phase 5 scope.
- Stateless fixtures only: rejected because signup, transfer creation, PATCH, disputes, and audit logs must mutate state.

## R-004: Query Semantics

**Decision**: Collection routes support exact-match filtering for fields used by the updated frontend, including `email`, `password`, `userId`, and `status`. Collection responses always return arrays.

**Rationale**: This matches JSON Server behavior used for login, signup duplicate checks, user dashboards, notifications, disputes, and admin risk queues.

**Alternatives Rejected**:

- Search-like filtering or partial matching: rejected because frontend behavior expects exact credential and id matches.
- 404 for no collection matches: rejected because frontend expects an empty array.

## R-005: Updates and Lifecycle Enforcement

**Decision**: Ordinary `PATCH /resource/{id}` calls are permissive partial updates. Dedicated action routes enforce valid state transitions and reject impossible transitions without mutation.

**Rationale**: This is the clarified hybrid behavior. It preserves mock-server compatibility while giving backend-owned action routes real lifecycle semantics.

**Alternatives Rejected**:

- Fully permissive actions: rejected because admin/risk workflows need backend-owned invalid-transition protection.
- Strict validation on generic PATCH: rejected because the frontend uses PATCH as JSON Server would.

## R-006: Header-Free Demo Compatibility

**Decision**: Phase 4.5 resource calls do not require authorization headers. Role-sensitive behavior is inferred from FlowX user records and request payload context where available.

**Rationale**: `apiClient.ts` only sends `Accept` and `Content-Type`. Requiring a bearer token would break the updated frontend.

**Alternatives Rejected**:

- Reuse Phase 4 bearer middleware for all new routes: rejected because it conflicts with the clarified contract.
- Implement Sanctum now: rejected as Phase 6 scope.

## R-007: Error Shape

**Decision**: Use consistent JSON error responses with appropriate HTTP status codes: 404 for missing items, 422 for validation failures, 409 for invalid lifecycle transitions, and 500 only for unexpected failures.

**Rationale**: The frontend throws `Error(await response.text())` for non-2xx responses, so exact error body parsing is not required. Consistency still matters for backend tests and debugging.

**Alternatives Rejected**:

- Plain text errors: rejected because the Laravel backend already has structured error conventions.
- Always return 200 with error flags: rejected because it hides action failures.

## R-008: Seed Data

**Decision**: Seed the temporary FlowX store from the minimum dataset in `updated_frontend/db.json`, normalized into PHP arrays or fixtures under backend-owned code/tests.

**Rationale**: The db.json file contains the demo admin, demo user, pending user, wallets, transfers, config, agents, payment methods, analytics, and activity shapes needed for frontend screens.

**Alternatives Rejected**:

- Invent new seed fixtures: rejected because it risks drift from the updated frontend.

## R-009: Status Vocabulary

**Decision**: FlowX transfer statuses use the uppercase `TransferStatus` vocabulary from `updated_frontend/src/services/types.ts`.

**Rationale**: The updated frontend renders these values and filters `UNDER_REVIEW` directly.

**Alternatives Rejected**:

- Map to Phase 4 transaction statuses on the wire: rejected because it would break response shape and display logic.

## R-010: Contract Test Generation

**Decision**: Create Pest contract tests grouped by frontend source file and endpoint family before implementation. Each group records the source path it was derived from.

**Rationale**: This satisfies constitution Principles II and III and makes the new resource contract executable.

**Alternatives Rejected**:

- Manual smoke testing only: rejected because it cannot protect the full resource surface.
