# Data Model: API Discovery (Phase 1)

**Date**: 2026-04-29
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

This file describes the **structural model of the deliverable itself** —
what fields each entry carries, what the relationships are between
entries, and what validation rules apply. It is *not* a database schema:
Phase 1 introduces no persistence. The shape of the entities the
eventual backend will serve (User, Transaction, etc.) lives inside the
deliverable (`api-contract.md` plus `contracts/entities/*.schema.json`),
not in this file.

The seven structural entities below are the spec's "Key Entities" section
expanded into reviewable, validatable form.

---

## E1 — API Contract Document

The single canonical Markdown narrative (`api-contract.md`).

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | yes | "API Contract — Salamhack Backend" or equivalent |
| version | string | yes | semver, e.g. `v1.0.0`; matches FR-015 |
| last_updated | string | yes | ISO date, e.g. `2026-04-29` |
| audit_commit | string | yes | git short SHA at audit time, for reproducibility |
| audit_method_note | section | yes | exact procedure from research.md R3, copied verbatim |
| changelog | section | yes | reverse-chronological; per R4 conventions |
| endpoints | list of Endpoint Entry | yes | ≥0 entries; may be 0 only if every frontend operation is client-only |
| entities | list of Data Entity | yes | one per typed export the frontend consumes |
| third_party_integrations | section | yes | per FR-017; ≥0 entries; required even if empty |
| auth | section | yes | (a) audit findings + (b) wire-level recommendation; per FR-010 |
| contradiction_register | list of Contradiction Register Entry | yes | per FR-014; required even if empty (state "no contradictions" explicitly) |

**Validation rules**:

- `version` MUST be `vMAJOR.MINOR.PATCH`.
- `last_updated` MUST be ≥ the date of the most recent changelog entry.
- The document MUST contain 0 unresolved `[NEEDS CLARIFICATION]`
  placeholders (mirrors spec checklist).
- The document MUST contain 0 backend implementation references
  (Laravel, PHP, Sanctum, Passport, Eloquent, ORM, database engine
  names, etc.) — SC-009.
- Every `endpoints[*].source_citation` MUST resolve to a path under
  `frontend/` — SC-001.

**Relationships**:

- 1 document → many Endpoint Entries
- 1 document → many Data Entities
- 1 document → many Contradiction Register Entries
- 1 document ↔ 1 OpenAPI sidecar (`contracts/openapi.yaml`) — must be
  kept in sync; the Markdown is authoritative on disagreement (R1).

---

## E2 — Endpoint Entry

One record per candidate backend operation.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | stable identifier, e.g. `EP-001`; used in OpenAPI extensions and changelog |
| method | enum | yes | `GET` \| `POST` \| `PUT` \| `PATCH` \| `DELETE` |
| path | string | yes | e.g. `/api/transactions/{id}` |
| query_parameters | list | yes | per-parameter: name, type, required; empty list allowed |
| request_headers | list | yes | name + value pattern + required flag (must include `Content-Type` and `Accept` where applicable) |
| request_body_shape | reference | conditional | `$ref` to a Data Entity for non-GET endpoints; `null` for GET |
| response_body_shape | reference | yes | `$ref` to a Data Entity; for collection endpoints, the wrapper shape |
| status_codes | list | yes | every documented status the endpoint emits, with description |
| error_envelope | reference | yes | `$ref` to the canonical error entity |
| auth_requirement | enum | yes | `none` \| `required` \| `optional`; per FR-010 recommendation |
| classification | enum | yes | `observed` \| `derived` — FR-007 |
| source_citation | string | yes | per R2 (file+symbol, file+lines, or page name) — FR-008 |
| phase3_grounding_note | string | conditional | required iff classification = `derived` — FR-009 |
| frontend_operation | string \| null | optional | `DemoContextValue` method name or reducer action `type` |
| frontend_flow | list of string | optional | page component names this entry appears in |
| status_side_effects | list | conditional | required iff endpoint transitions `TxStatus`; per FR-019 |
| id_origin_candidates | list | conditional | required iff request creates an entity with an identifier — `[server-issued, client-supplied, either]` per FR-018; deliverable does NOT pick one |

**Validation rules**:

- If `classification = derived`, `phase3_grounding_note` MUST be
  non-empty.
- If `method = GET`, `request_body_shape` MUST be `null`.
- `status_codes` MUST contain at least one 2xx entry and at least one
  4xx entry (validation envelope).
- `source_citation` MUST point at a path under `frontend/`.
- `auth_requirement` MUST match the auth recommendation in E1's `auth`
  section.

**State transitions**: an Endpoint Entry can be reclassified
`derived → observed` when the frontend later issues the corresponding
HTTP request; that's a MINOR version bump per R4. The reverse direction
is not permitted (a real request cannot become hypothetical).

---

## E3 — Frontend Operation

A specific function or reducer action exposed by the frontend's central
state module. Used to produce coverage SCs (SC-003) but does not
appear in the deliverable on its own — it is a *cross-reference* held
inside Endpoint Entries via `frontend_operation`.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | e.g. `createTransaction`, `CONFIRM_DEPOSIT` |
| kind | enum | yes | `context_method` \| `reducer_action` |
| signature | string | yes | parameter names and types |
| source_file | string | yes | e.g. `frontend/src/context/DemoContext.tsx` |
| coverage | enum | yes | `mapped_to_endpoint` \| `client_only` |
| mapped_endpoint_id | string | conditional | required iff coverage = `mapped_to_endpoint` |

**Validation rules**:

- The set of Frontend Operations enumerated MUST equal the set of
  methods on `DemoContextValue` ∪ the set of reducer action `type`
  values, at audit-commit. SC-003 is "100% addressed".

---

## E4 — Frontend Flow

A page-level user journey under `frontend/src/pages/`.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| page_name | string | yes | component name, e.g. `NewTransferPage` |
| source_file | string | yes | e.g. `frontend/src/pages/NewTransferPage.tsx` |
| summary | string | yes | one-sentence description |
| operations_used | list of string | yes | the Frontend Operation names invoked |
| coverage | enum | yes | `addressed_by_endpoints` \| `no_backend_operation_required` |
| addressed_endpoint_ids | list of string | conditional | required iff coverage = `addressed_by_endpoints` |

**Validation rules**:

- Set of Frontend Flows MUST equal the set of files under
  `frontend/src/pages/*.tsx` at audit-commit. SC-002 is "100% addressed".

---

## E5 — Data Entity

A typed object the frontend consumes.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | e.g. `Transaction`, `User` |
| source_file | string | yes | e.g. `frontend/src/types.ts` |
| field_breakdown | list | yes | per-field: name, type, required, allowed values, example value |
| id_field_name | string \| null | conditional | required if entity carries an identifier |
| id_origin_observed | string \| null | conditional | required iff `id_field_name` is non-null; e.g. "client-side via `crypto.randomUUID()`" — FR-018 |
| drift_notes | string | optional | non-empty iff multiple sources disagree on field shape |
| schema_file | string | yes | path to `contracts/entities/<EntityName>.schema.json` |

**Validation rules**:

- Set of Data Entities MUST equal the set of typed exports from
  `frontend/src/types.ts` ∪ user-data exports from
  `frontend/src/lib/demoStore.ts`. SC-004 is "100% documented".
- Each Data Entity MUST have a corresponding JSON Schema file under
  `contracts/entities/`.

---

## E6 — Source Citation

A pointer that grounds a claim. Embedded inside Endpoint Entries (and
optionally Data Entities); not stored as a separate top-level entry.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| kind | enum | yes | `file_symbol` \| `file_lines` \| `page_component` |
| value | string | yes | per R2 format conventions |

**Validation rules**:

- `value` MUST resolve to a path under `frontend/`.
- `value` MUST corroborate the claim in isolation (reviewer-verifiable
  without external context) — FR-008.

---

## E7 — Contradiction Register Entry

One record per place where the frontend's current behavior cannot, by
itself, ground a contract test.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | stable identifier, e.g. `CR-001` |
| affected_endpoint_ids | list of string | yes | which Endpoint Entries are implicated |
| principle_implicated | enum | yes | `I` \| `III` (the constitutional principle) |
| description | string | yes | one paragraph explaining the contradiction |
| recommended_owner | enum | yes | `phase_2` \| `phase_3` \| `phase_6` \| `constitution_amendment` |
| recommended_path_forward | string | yes | one paragraph; describes how the gap will be closed (without resolving it in Phase 1) |

**Validation rules**:

- `affected_endpoint_ids` MUST reference real Endpoint Entry IDs.
- The register MUST be present in the deliverable even if empty; an
  empty register MUST state "No contradictions detected at audit time"
  explicitly — SC-008.

---

## Coverage matrix (how the model satisfies the spec)

| Spec FR/SC | Covered by |
|------------|------------|
| FR-001, SC-001 | E1 (single canonical doc) + E6 (citations) |
| FR-002 | E1.audit_method_note + research.md R3 step 1 |
| FR-003, SC-002 | E4 (Frontend Flow with coverage enum) |
| FR-004, SC-003 | E3 (Frontend Operation with coverage enum) |
| FR-005, SC-004 | E5 (Data Entity with field_breakdown + schema_file) |
| FR-006 | E2 (full endpoint shape) |
| FR-007 | E2.classification + OpenAPI `x-classification` |
| FR-008, SC-001 | E2.source_citation + E6 |
| FR-009, SC-007 | E2.phase3_grounding_note + OpenAPI `x-phase3-grounding-note` |
| FR-010, SC-015 | E1.auth section (audit + recommendation) |
| FR-011, SC-009 | E1 validation rule (zero backend implementation refs) |
| FR-012, SC-005 | E1 + E6 (single-pass review with cited claims) |
| FR-013 | E3.coverage = client_only / E4.coverage = no_backend_operation_required |
| FR-014, SC-008 | E7 (Contradiction Register Entry) |
| FR-015, SC-011 | E1.version + E1.changelog |
| FR-016, SC-010 | Plan-level constraint; no entity carries frontend mutation state |
| FR-017, SC-012 | E1.third_party_integrations |
| FR-018, SC-013 | E5.id_origin_observed + E2.id_origin_candidates |
| FR-019, SC-014 | E2.status_side_effects |
