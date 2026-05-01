# FlowX Persistence Contract

This contract extends the Phase 4.5 FlowX resource contract without changing the frontend-visible HTTP behavior documented in `../006-api-alignment-refactor/contracts/flowx-resource-contract.md`.

## Compatibility Rules

- The updated frontend continues to use the same base URL, paths, methods, query filters, request fields, and response fields.
- No frontend source changes are allowed.
- Collection reads continue to return arrays.
- Empty exact-match filters continue to return `[]`.
- Item reads continue to return a single object or not-found response.
- Creates return the created object.
- Partial updates return the updated object and preserve omitted fields.
- Invalid lifecycle actions return a failure without mutating persisted data.

## Persistence Rules

| Behavior | Contract |
|----------|----------|
| Backend restart | Successful FlowX creates, updates, lifecycle actions, configuration changes, and audit logs remain visible after restart. |
| Empty persistent environment | Baseline demo data can be initialized so user and admin dashboards load without manual data entry. |
| Repeated initialization | Existing user-created data is not overwritten and baseline records are not duplicated. |
| Explicit reset | Local demo data may be cleared and restored to baseline only through an intentional reset workflow. |
| Temporary Phase 4.5 data | Existing temporary runtime data is not imported or required. |
| Canonical transfer data | FlowX transfers are the canonical persisted transfer-like records when legacy transaction behavior overlaps. |
| Relationship integrity | Writes that reference missing required users, transfers, wallets, verifications, disputes, notifications, or config records fail without orphaned records. |
| Multi-record actions | Successful admin/workflow actions persist all related changes and audit logs as one complete outcome. |

## Initialization Contract

From an empty SQLite database:

1. Run migrations.
2. Run the baseline FlowX seeder.
3. Verify demo users, wallets, transfers, verifications, disputes, notifications, configuration, audit logs, agents, payment methods, analytics, activities, and requests are available.
4. Re-run the baseline seeder and verify no duplicate baseline users, wallets, configuration, agents, or payment methods are created.

## Durability Smoke Contract

1. Start with migrated and seeded persistence.
2. Create a transfer through the existing FlowX transfer create behavior.
3. Perform at least one lifecycle action.
4. Update configuration as admin.
5. Restart the backend process.
6. Read transfers, configuration, and audit logs through the same Phase 4.5 frontend-visible behavior.
7. Confirm identifiers, statuses, relationships, and audit entries remain intact.

## Legacy Compatibility Contract

- Existing Phase 4 auth and transaction behavior remains available.
- Where Phase 4 transaction behavior overlaps transfer concepts, it adapts to canonical FlowX transfer records.
- Phase 4 and Phase 4.5 compatibility tests must pass in the same persistent test run.
