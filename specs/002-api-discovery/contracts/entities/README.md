# Entity JSON Schemas

This directory holds one JSON Schema file per Data Entity surfaced in
`../../api-contract.md`. The directory is created by `/speckit-plan`;
files are populated by `/speckit-implement` based on the audit of
`frontend/src/types.ts` and `frontend/src/lib/demoStore.ts`.

## Conventions

- **One file per entity.** Filename: `<EntityName>.schema.json` (PascalCase
  matching the frontend's exported type name, e.g. `Transaction.schema.json`,
  `User.schema.json`, `NotificationItem.schema.json`).
- **JSON Schema dialect:** `https://json-schema.org/draft/2020-12/schema`
  (the dialect OpenAPI 3.1 aligns with — see `../openapi.yaml`).
- **`$id`:** `https://salamhack.local/schemas/<EntityName>.json` (or any
  stable URI; the value is irrelevant as long as it's unique within the
  schema set).
- **Source citation:** every schema carries an `x-source-citation` field
  at the root referencing the frontend file (e.g.,
  `"x-source-citation": "frontend/src/types.ts#User"`). This mirrors the
  Markdown deliverable's source-citation requirement (spec FR-008).
- **ID origin:** entities carrying an identifier MUST include an
  `x-id-origin-observed` field at the root recording where the value is
  produced today (per spec FR-018). The schema MUST NOT pick a future
  ID-origin position; that is deferred to Phase 2.
- **No backend implementation references.** No Laravel, Eloquent, ORM,
  or DB-engine names. Wire-level only (spec FR-011 / SC-009).

## Expected entity files (added by `/speckit-implement`)

Based on the audit at audit-commit time, the following files are
expected. The precise list is finalised when the audit runs:

- `Transaction.schema.json` — `frontend/src/lib/demoStore.ts`
- `TxStatus.schema.json` — `frontend/src/lib/demoStore.ts` (enum)
- `User.schema.json` — `frontend/src/types.ts`
- `NotificationItem.schema.json` — `frontend/src/lib/demoStore.ts`
- `AuditLogEntry.schema.json` — `frontend/src/lib/demoStore.ts` (the
  inline `auditLog` element type on `Transaction`)
- `DemoConfig.schema.json` — `frontend/src/lib/demoStore.ts`
  (`DEMO_CONFIG`'s shape)
- `ErrorEnvelope.schema.json` — the canonical error response shape;
  classification = derived; cited from page-level error UI plus the
  auth recommendation (spec FR-010(b)).

If an entity is added or removed during `/speckit-implement`, that
change is recorded in the deliverable's changelog (per research.md R4).

## Why a directory and not inline in `openapi.yaml`?

So Phase 3 contract tests can reference an entity's shape directly via
`$ref` to a single schema file, without parsing the full OpenAPI
envelope. See research.md R5.
