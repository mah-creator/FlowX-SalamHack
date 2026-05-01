# FlowX Persistence Tests

Phase 5 tests use SQLite through Laravel migrations and must not depend on
`storage/framework/flowx-store.json`.

The baseline FlowX dataset comes from `tests/Fixtures/FlowX/db.json`. Seeders
must be idempotent: ordinary seeding creates missing baseline data without
overwriting user-created records. Demo reset behavior must be explicit.
