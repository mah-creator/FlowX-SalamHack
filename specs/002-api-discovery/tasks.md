---
description: "Tasks for API Discovery (Phase 1)"
---

# Tasks: API Discovery (Phase 1)

**Input**: Design documents from `/specs/002-api-discovery/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: This is a documentation-only feature. The "test" is the
spec's 15 Success Criteria (SC-001 .. SC-015) plus the requirements
checklist at `specs/002-api-discovery/checklists/requirements.md`. No
runtime tests are written. The OpenAPI structural validation in T035 is
a smoke check, not a contract test.

**Organization**: Tasks are grouped by user story (US1 = P1, US2 = P2,
US3 = P3) so each story can be exited independently. The deliverable's
files are shared across stories, so most tasks within a phase are
sequential rather than parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different file, no dependencies on
  incomplete tasks
- **[Story]**: maps to a user story in spec.md (US1 = P1, US2 = P2,
  US3 = P3)
- Every task names exact file paths

## Path conventions

All deliverable paths are relative to repo root:

- Canonical Markdown: `specs/002-api-discovery/api-contract.md`
- OpenAPI sidecar:    `specs/002-api-discovery/contracts/openapi.yaml`
- Entity schemas:     `specs/002-api-discovery/contracts/entities/<Name>.schema.json`
- Audit subject (READ-ONLY): `frontend/src/...` and `frontend/package.json`

## Cheaper-LLM execution rules (READ FIRST)

These rules apply to every task below. Follow them strictly.

1. **Read the references named in each task.** A task that says "per
   data-model.md E2" means the implementor MUST open
   `specs/002-api-discovery/data-model.md`, find section E2, and use
   its field table as the contract for what to write. Do not invent
   fields.
2. **Cite frontend sources by exact path + symbol or line range.**
   Use one of the three R2 formats from `research.md`:
   `frontend/src/lib/demoStore.ts#nextTxId`,
   `frontend/src/context/DemoContext.tsx:88-114`, or
   `frontend/src/pages/NewTransferPage.tsx`. Never write a vague
   "see DemoContext".
3. **Stay tech-agnostic on the wire.** Do NOT write any of these
   strings into `api-contract.md`, `openapi.yaml`, or any
   `*.schema.json`: `Laravel`, `PHP`, `Sanctum`, `Passport`,
   `Eloquent`, `MySQL`, `Postgres`, `MariaDB`, `SQLite`, `Redis`,
   `composer`, `artisan`. Spec FR-011 / SC-009. If a backend choice
   feels relevant, defer it to Phase 2 with an explicit "deferred"
   note.
4. **Do NOT modify any file under `frontend/`.** Spec FR-016 / SC-010.
   The frontend is the audit subject and must remain byte-identical
   to its state at branch-creation. Read-only.
5. **Every endpoint entry MUST carry**: `id`, `method`, `path`,
   `query_parameters`, `request_headers`, `request_body_shape`,
   `response_body_shape`, `status_codes`, `error_envelope`,
   `auth_requirement`, `classification` (`observed` | `derived`),
   `source_citation`, `phase3_grounding_note` (required iff
   `classification = derived`), and the optional cross-references
   `frontend_operation`, `frontend_flow`. See data-model.md E2.
6. **Every endpoint that creates an entity with an identifier MUST**
   list `id_origin_candidates: [server-issued, client-supplied, either]`
   and MUST NOT pick one. Spec FR-018, data-model.md E2.
7. **Every derived endpoint MUST have a non-empty `phase3_grounding_note`.**
   The note explains how Phase 3 will source the contract test
   (capture from a future frontend change, treat the local state
   operation as the de-facto contract, defer until the frontend
   wires the call). Spec FR-009.
8. **OpenAPI mirroring is 1:1.** Every endpoint entry written into
   `api-contract.md` must have a corresponding path operation in
   `openapi.yaml` carrying the `x-classification`,
   `x-source-citation`, and (if derived) `x-phase3-grounding-note`
   extensions per research.md R5.
9. **When in doubt, read more of the frontend.** The audit's truth
   source is `frontend/src/`, not assumption.

---

## Phase 1: Setup

**Purpose**: Confirm the deliverable workspace exists and the audit
subject is intact.

- [X] T001 Verify the deliverable workspace by listing `specs/002-api-discovery/`. Confirm presence of `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `checklists/requirements.md`, `contracts/openapi.yaml`, `contracts/entities/README.md`. If any file is missing, abort and re-run `/speckit-plan`.
- [X] T002 Capture the audit-commit by running `git rev-parse --short HEAD` from repo root and recording the value. This SHA will be written into `api-contract.md` and `openapi.yaml` in T004 and T036.
- [X] T003 Verify the audit subject is untouched by running `git status -- frontend/` from repo root. Expected output: empty (no modifications to any file under `frontend/`). If the output is not empty, abort — Spec FR-016 / SC-010 forbid frontend modifications during Phase 1.

**Checkpoint**: Workspace and audit subject confirmed. Foundation phase can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the canonical Markdown skeleton and run the audit
procedure once. Every later task reads this file and either fills a
section or cross-references it.

**⚠️ CRITICAL**: No user story work can begin until Phase 2 is complete.

- [X] T004 Create the file `specs/002-api-discovery/api-contract.md` with the title block and section skeleton. The file MUST contain, in order: a title `# API Contract — Salamhack Backend (Phase 1 Discovery)`, a metadata block with lines `**Version**: v1.0.0`, `**Last-Updated**: 2026-04-29`, `**Audit-Commit**: <SHA from T002>`, `**Status**: Draft (populated by /speckit-implement)`; then empty section headers in this exact order: `## Changelog`, `## Audit Method & Findings`, `## Authentication`, `## Third-Party Integrations`, `## Data Entities`, `## Endpoints`, `## Frontend Operations Coverage`, `## Frontend Flows Coverage`, `## Contradiction Register`. Each section header MUST be followed by a `_TODO_` placeholder line (so reviewers see population progress). Use the field shape from `data-model.md` E1.

- [X] T005 Populate the `## Audit Method & Findings` section in `api-contract.md`. Copy the six audit steps verbatim from `research.md` R3 ("Audit method"). Then add a "Findings" subsection with three bullets recording the literal results of running each step on the current commit:
  - Bullet 1: HTTP-call grep result. Run the equivalent of `rg -n "fetch\(|axios|XMLHttpRequest|ky\(|got\(|VITE_.*_URL|process\.env\..*_URL" frontend/src/`. Record the count and any matches. Expected at audit-commit: 0 matches in `frontend/src/`. If non-zero, list each match with file path and line.
  - Bullet 2: Page enumeration. List every file matched by `frontend/src/pages/*.tsx`. Expected at audit-commit (verify by `ls frontend/src/pages/`): `AdminDashboardPage.tsx`, `AwaitingDepositPage.tsx`, `DashboardPage.tsx`, `DisputePage.tsx`, `LandingPage.tsx`, `MatchFoundPage.tsx`, `NewTransferPage.tsx`, `SignupPage.tsx`, `TransactionStatusPage.tsx`, `VerificationPage.tsx`.
  - Bullet 3: Third-party SDK enumeration. List every entry in `frontend/package.json` `dependencies` and `devDependencies` whose package name suggests an external service (rule of thumb: any package whose name starts with `@google/`, `@aws-`, `@azure/`, contains `firebase`, `stripe`, `auth0`, `gemini`, `openai`, `anthropic`, etc.). Expected at audit-commit: `@google/genai` only.

**Checkpoint**: Skeleton + audit findings recorded. User-story phases can begin.

---

## Phase 3: User Story 1 — Complete sourced inventory (Priority: P1) 🎯 MVP

**Goal**: Produce the full Endpoint Entry list, the full Data Entity list with field breakdowns, the Third-Party Integrations section, and the Authentication section (audit + wire-level recommendation). Every entry carries a source citation; every derived entry carries a Phase 3 grounding note.

**Independent Test**: Pick any three Endpoint Entries from `api-contract.md`, follow each `source_citation` to the named frontend file/symbol/lines, and confirm the cited code corroborates the entry's request shape, response shape, and status side effects without further context (per quickstart.md §2).

### Implementation for User Story 1 — Data Entities first (referenced by endpoints)

- [X] T006 [US1] Populate the `## Data Entities` section in `specs/002-api-discovery/api-contract.md` with one subsection per entity. Use the field shape from `data-model.md` E5. Required entities, each with: name, source citation, field breakdown (table: name, type, required, allowed values, example), `id_field_name`, `id_origin_observed` (per FR-018), `drift_notes` (if any), `schema_file` path:
  - `User` from `frontend/src/types.ts:12-17`. No identifier field. No drift.
  - `Transaction` from `frontend/src/lib/demoStore.ts:14-29`. `id_field_name`: `id`. `id_origin_observed`: "client-side via `nextTxId(state.transactions.length)` producing `TR-####` strings; cite `frontend/src/lib/demoStore.ts#nextTxId` (lines 60-62 of demoStore equivalent in DemoContext.tsx)". Field breakdown enumerates: `id`, `source` (enum Gaza|Egypt), `destination` (enum Gaza|Egypt), `amount` (number), `currency` (enum USD|EGP|ILS), `status` (enum — see TxStatus), `feePercent`, `exchangeRate`, `receivableAmount`, `createdAt` (ISO string), `depositA` (boolean), `depositB` (boolean), `disputeReason` (optional string), `auditLog` (array of AuditLogEntry).
  - `TxStatus` from `frontend/src/lib/demoStore.ts:1-12`. Type: enum (string union). Allowed values: 11 listed. No identifier.
  - `NotificationItem` from `frontend/src/lib/demoStore.ts:43-46`. `id_field_name`: `id`. `id_origin_observed`: "client-side via `crypto.randomUUID()`; cite `frontend/src/context/DemoContext.tsx:67`". Fields: `id` (uuid string), `message` (string).
  - `AuditLogEntry` (inline element type of `Transaction.auditLog`). Source citation: `frontend/src/lib/demoStore.ts:28`. No identifier. Fields: `time` (ISO string), `actor` (string), `action` (string).
  - `DemoConfig` from `frontend/src/lib/demoStore.ts:31-36`. No identifier. Fields: `feePercent` (number), `exchangeRate` (number), `rateLockMinutes` (number), `paymentWindowMinutes` (number). Drift note: this is demo configuration, not a backend-served entity — mark as "configuration entity, candidate for backend `GET /config` (derived)".
  - `ErrorEnvelope` (no frontend source — the recommended error shape). Source citation: `derived from auth recommendation (FR-010(b))`. No identifier. Fields: `error` (object: `code` string, `message` string, `details` optional object). Mark classification "derived"; phase3_grounding_note: "no observed error response today; treat the recommended envelope as the de-facto contract until the frontend issues a request that surfaces an error".

- [X] T007 [P] [US1] Create `specs/002-api-discovery/contracts/entities/User.schema.json` from the `User` field breakdown in `api-contract.md` (T006). Use JSON Schema draft 2020-12 per `contracts/entities/README.md`. Include `$schema`, `$id` (`https://salamhack.local/schemas/User.json`), `title`, `type: object`, `required`, `properties`, `additionalProperties: false`, `x-source-citation` (root-level: `frontend/src/types.ts:12-17`). No `x-id-origin-observed` (no ID field).

- [X] T008 [P] [US1] Create `specs/002-api-discovery/contracts/entities/Transaction.schema.json` from the `Transaction` field breakdown. Same conventions as T007. Include `x-source-citation: frontend/src/lib/demoStore.ts:14-29`. Include `x-id-origin-observed: client-side via nextTxId(state.transactions.length)`. Reference `TxStatus.schema.json` via `$ref: ./TxStatus.schema.json` for the `status` field. Reference `AuditLogEntry.schema.json` via items `$ref` for the `auditLog` array.

- [X] T009 [P] [US1] Create `specs/002-api-discovery/contracts/entities/TxStatus.schema.json`. `type: string`, `enum: [...11 values from T006...]`, `x-source-citation: frontend/src/lib/demoStore.ts:1-12`.

- [X] T010 [P] [US1] Create `specs/002-api-discovery/contracts/entities/NotificationItem.schema.json`. Properties: `id` (string, uuid format), `message` (string). `x-source-citation: frontend/src/lib/demoStore.ts:43-46`. `x-id-origin-observed: client-side via crypto.randomUUID()`.

- [X] T011 [P] [US1] Create `specs/002-api-discovery/contracts/entities/AuditLogEntry.schema.json`. Properties: `time` (string, date-time format), `actor` (string), `action` (string). `x-source-citation: frontend/src/lib/demoStore.ts:28`.

- [X] T012 [P] [US1] Create `specs/002-api-discovery/contracts/entities/DemoConfig.schema.json`. Properties: `feePercent`, `exchangeRate`, `rateLockMinutes`, `paymentWindowMinutes` (all numbers). `x-source-citation: frontend/src/lib/demoStore.ts:31-36`.

- [X] T013 [P] [US1] Create `specs/002-api-discovery/contracts/entities/ErrorEnvelope.schema.json`. Properties: `error` (object with required `code` string and `message` string, optional `details` object). `x-source-citation: derived from FR-010(b) auth recommendation`. `x-classification: derived`.

### Implementation for User Story 1 — Third-Party Integrations and Authentication

- [X] T014 [US1] Populate `## Third-Party Integrations` in `api-contract.md` per spec FR-017. List one row per declared external-service SDK from `frontend/package.json`. For each, record: SDK name, version range (from `package.json`), env-var wiring (e.g., `GEMINI_API_KEY` referenced in `frontend/vite.config.ts:11`), invocation status (`invoked from frontend/src/` vs. `declared but not invoked`), and the rule from spec FR-017 ("excluded from endpoint entries unless invoked from `frontend/src/`"). Expected at audit-commit: one entry, `@google/genai`, declared-but-not-invoked, with `GEMINI_API_KEY` env wiring noted.

- [X] T015 [US1] Populate `## Authentication` in `api-contract.md` per spec FR-010, in two subsections:
  - **Audit (descriptive).** Record the audit findings: zero `Authorization` header construction in `frontend/src/`, zero token storage (no `localStorage.setItem`/`sessionStorage.setItem` for credentials), no login API call, no cookie reads. Cite: `frontend/src/types.ts:12-17` (`User` type exists but is never populated by an HTTP call), `frontend/src/pages/SignupPage.tsx` and `frontend/src/pages/VerificationPage.tsx` (signup/verify UI flows that imply authentication but issue no requests).
  - **Recommendation (forward-looking, derived).** Specify the wire-level scheme. Use **bearer token in `Authorization: Bearer <token>` header**. Document: header name (`Authorization`), credential format (opaque token string returned by login), implied endpoints (`POST /auth/signup`, `POST /auth/verify`, `POST /auth/login`, `POST /auth/logout` — each will appear in the Endpoints section with full shape), unauthenticated-error envelope (`401 { error: { code: "unauthenticated", message: ... } }`), unauthorized-error envelope (`403 { error: { code: "forbidden", message: ... } }`). Mark `x-classification: derived` and add a `phase3_grounding_note`: "no current frontend behavior grounds this; Phase 3 will defer authentication contract tests until the frontend wires login, OR Phase 2 may treat the recommended envelope as the de-facto contract pending a Principle III amendment". Do NOT name Sanctum or Passport (Phase 2/6 decision; FR-011 / SC-009).

### Implementation for User Story 1 — Endpoint Entries (the bulk)

Each endpoint task below populates one or more Endpoint Entry blocks in
the `## Endpoints` section of `api-contract.md`. Use the field shape
from `data-model.md` E2 (id, method, path, query_parameters,
request_headers, request_body_shape, response_body_shape, status_codes,
error_envelope, auth_requirement, classification, source_citation,
phase3_grounding_note, frontend_operation, frontend_flow,
status_side_effects, id_origin_candidates).

All endpoints below are `classification: derived` (the frontend issues
zero HTTP requests at audit-commit per T005). Every entry MUST carry a
non-empty `phase3_grounding_note`. The recommended note for derived
entries grounded in a `DemoContextValue` method is: *"Treat the named
`DemoContextValue` method (and its reducer action) as the de-facto
contract; Phase 3 will assert the recommended request and response
shape against this entry until the frontend wires the actual HTTP
call, at which point this entry will be reclassified observed and the
test re-grounded against the captured request."*

For every write endpoint that returns the resource it acts on, the
`response_body_shape` references `Transaction.schema.json` (or the
relevant entity schema). For every endpoint that may transition
`TxStatus`, fill `status_side_effects` per FR-019 (which transitions
this endpoint may cause).

- [X] T016 [US1] Append Endpoint Entries `EP-001` and `EP-002` to the `## Endpoints` section: transaction read endpoints. Sub-tasks:
  - `EP-001 GET /transactions` — list transactions for the current user. `auth_requirement: required`. Response: `{ transactions: Transaction[] }` (envelope chosen for derivability; cite ground note). Status codes: 200, 401. `frontend_flow: [DashboardPage]`. Source citation: `frontend/src/pages/DashboardPage.tsx`. Status side effects: none. ID-origin candidates: N/A (read).
  - `EP-002 GET /transactions/{id}` — read single transaction. `auth_requirement: required`. Response: full `Transaction` entity. Status codes: 200, 401, 403, 404. `frontend_flow: [TransactionStatusPage, AwaitingDepositPage, MatchFoundPage, DisputePage]`. Source citation: `frontend/src/pages/TransactionStatusPage.tsx`. Note explicitly: this endpoint is the channel through which **auto-transitions** (e.g., `Processing Payouts` → `Completed` after `setTimeout` in `frontend/src/context/DemoContext.tsx:210-219`) become observable to the frontend, per FR-019.

- [X] T017 [US1] Append Endpoint Entries `EP-003` through `EP-009` to the `## Endpoints` section: transaction write endpoints (user-driven). Sub-tasks (each one Endpoint Entry):
  - `EP-003 POST /transactions` — create transaction. Maps to `createTransaction` in `frontend/src/context/DemoContext.tsx#createTransaction` (lines 168-170). Request body: `{ amount: number, currency: "USD" | "EGP" | "ILS" }` (cite `frontend/src/context/DemoContext.tsx:168-170`). Response: full `Transaction`. Status codes: 201, 400, 401. `id_origin_candidates: [server-issued, client-supplied, either]` per FR-018. `status_side_effects`: creates with `status: "Pending Request"`. `frontend_operation: createTransaction`. `frontend_flow: [NewTransferPage]`.
  - `EP-004 POST /transactions/{id}/cancel` — cancel pending or matched transaction. Maps to `cancelTransaction` (DemoContext.tsx:171-184). Request body: empty. Response: full `Transaction`. Status codes: 200, 401, 403, 404, 409 (cancellation only allowed before deposits — cite the eligibility check at lines 175-180). `status_side_effects`: `Pending Request` | `Match Found` → `Failed`. `frontend_operation: cancelTransaction`.
  - `EP-005 POST /transactions/{id}/confirm-match` — user confirms a found match. Maps to `confirmMatch` (DemoContext.tsx:191-193). Request body: empty. Response: full `Transaction`. Status codes: 200, 401, 403, 404, 409. `status_side_effects`: `Match Found` → `Awaiting Deposits`. `frontend_operation: confirmMatch`. `frontend_flow: [MatchFoundPage]`.
  - `EP-006 POST /transactions/{id}/deposits` — confirm a deposit by party A or B. Maps to `confirmDeposit` (DemoContext.tsx:194-196). Request body: `{ party: "A" | "B" }`. Response: full `Transaction`. Status codes: 200, 400, 401, 403, 404, 409. `status_side_effects`: when one party confirmed → `Deposit Confirmed Partially`; when both → `Both Deposits Confirmed` (cite lines 125-138). `frontend_operation: confirmDeposit`. `frontend_flow: [AwaitingDepositPage]`.
  - `EP-007 POST /transactions/{id}/payouts` — release payouts (both deposits required). Maps to `processPayouts` (DemoContext.tsx:197-220). Request body: empty. Response: full `Transaction`. Status codes: 202 (async; payout completes server-side later), 401, 403, 404, 409 (when deposits not confirmed). `status_side_effects`: `Both Deposits Confirmed` → `Processing Payouts`; later auto-transition `Processing Payouts` → `Completed` (cite the `setTimeout` at lines 210-219; document as auto-transition observable via `EP-002`, NOT a separate endpoint, per FR-019). `frontend_operation: processPayouts`.
  - `EP-008 POST /transactions/{id}/disputes` — open a dispute. Maps to `openDispute` (DemoContext.tsx:221-227). Request body: `{ reason: string }` (optional reason — cite the trim/empty handling at line 222). Response: full `Transaction`. Status codes: 200, 400, 401, 403, 404, 409. `status_side_effects`: any non-terminal status → `Disputed`. `frontend_operation: openDispute`. `frontend_flow: [DisputePage]`.
  - `EP-009 GET /admin/transactions` — list every transaction (admin view). `auth_requirement: required` with admin scope. Response: `{ transactions: Transaction[] }`. Status codes: 200, 401, 403. `frontend_flow: [AdminDashboardPage]`. Source citation: `frontend/src/pages/AdminDashboardPage.tsx`.

- [X] T018 [US1] Append Endpoint Entries `EP-010` through `EP-014` to the `## Endpoints` section: admin endpoints. Sub-tasks (each one Endpoint Entry):
  - `EP-010 POST /admin/transactions/{id}/match` — auto-match a pending request. Maps to `autoMatch` (DemoContext.tsx:185-190). The frontend's actor is "FlowX Matcher" — represent as an admin-or-system-callable endpoint. Request body: empty. Response: full `Transaction`. Status codes: 200, 401, 403, 404, 409. `status_side_effects`: `Pending Request` → `Match Found`. `frontend_operation: autoMatch`. `auth_requirement: required` (admin or service token).
  - `EP-011 POST /admin/transactions/{id}/flag` — flag a transaction for review. Maps to `flagRisk` (DemoContext.tsx:238-243). Request body: optional `{ reason: string }`. Response: full `Transaction`. Status codes: 200, 401, 403, 404. `status_side_effects`: → `Under Review`. `frontend_operation: flagRisk`. `frontend_flow: [AdminDashboardPage]`. `auth_requirement: required` (admin).
  - `EP-012 POST /admin/transactions/{id}/approve` — admin approves a flagged or pending transaction. Maps to `adminApprove` (DemoContext.tsx:244-252). Request body: empty. Response: full `Transaction`. Status codes: 200, 401, 403, 404, 409. `status_side_effects`: `Under Review` → `Both Deposits Confirmed`. `frontend_operation: adminApprove`. `auth_requirement: required` (admin).
  - `EP-013 POST /admin/transactions/{id}/refund` — admin issues a refund. Maps to `adminRefund` (DemoContext.tsx:253-259). Request body: optional `{ reason: string }`. Response: full `Transaction`. Status codes: 200, 401, 403, 404. `status_side_effects`: → `Refunded`. `frontend_operation: adminRefund`. `auth_requirement: required` (admin).
  - `EP-014 POST /admin/disputes/{transactionId}/resolve` — admin resolves a dispute. Maps to `resolveDispute` (DemoContext.tsx:228-237). Request body: `{ outcome: "Completed" | "Refunded" }`. Response: full `Transaction`. Status codes: 200, 400, 401, 403, 404, 409. `status_side_effects`: `Disputed` → `Completed` or `Refunded` per outcome. `frontend_operation: resolveDispute`. `auth_requirement: required` (admin).

- [X] T019 [US1] Append Endpoint Entries `EP-015` through `EP-018` to the `## Endpoints` section: auth endpoints (all derived; grounded in the FR-010 recommendation, not in observed traffic). Each entry MUST carry `classification: derived` and a `phase3_grounding_note` consistent with the auth recommendation note from T015. Sub-tasks:
  - `EP-015 POST /auth/signup` — create a new user account. Request body: `{ fullName: string, email: string, accountType: "Individual" | "Business", password: string }` (fields derived from `User` type plus the standard signup pattern). Response: `{ user: User, token: string }`. Status codes: 201, 400, 409 (email taken). `frontend_flow: [SignupPage]`. Source citation: `frontend/src/pages/SignupPage.tsx` plus `frontend/src/types.ts:12-17`. `id_origin_candidates: [server-issued, client-supplied, either]`.
  - `EP-016 POST /auth/verify` — verify the signup. Request body: `{ code: string }` or `{ token: string }` (whichever the verify-flow UI implies — read `VerificationPage.tsx` to decide; if ambiguous, document both as candidates per FR-018-style deferral). Response: `{ user: User }`. Status codes: 200, 400, 401. `frontend_flow: [VerificationPage]`. Source citation: `frontend/src/pages/VerificationPage.tsx`.
  - `EP-017 POST /auth/login` — exchange credentials for a bearer token. Request body: `{ email: string, password: string }`. Response: `{ user: User, token: string }`. Status codes: 200, 400, 401. Source citation: `derived from FR-010(b) auth recommendation`. The `phase3_grounding_note` MUST state: "no current frontend behavior grounds this; deferred until the frontend wires login OR Phase 2 treats the recommended envelope as the de-facto contract under a Principle III amendment". Mark with a Contradiction Register cross-reference (will be added in T024).
  - `EP-018 POST /auth/logout` — invalidate the current session. Request body: empty. Response: empty (204). Status codes: 204, 401. Source citation: `derived from FR-010(b) auth recommendation`. Same `phase3_grounding_note` framing as `EP-017`.

### Implementation for User Story 1 — OpenAPI sidecar mirroring

- [X] T020 [US1] Populate `specs/002-api-discovery/contracts/openapi.yaml` `components.schemas` by adding one `$ref` entry per entity created in T007–T013. Each component name matches the entity name (e.g., `User`, `Transaction`, `TxStatus`, `NotificationItem`, `AuditLogEntry`, `DemoConfig`, `ErrorEnvelope`); each entry's value is `{ "$ref": "./entities/<EntityName>.schema.json" }`.

- [X] T021 [US1] Populate `specs/002-api-discovery/contracts/openapi.yaml` `components.securitySchemes` per the auth recommendation in T015. Add an entry `bearerAuth: { type: http, scheme: bearer }`. Keep zero references to specific Laravel auth packages (FR-011 / SC-009).

- [X] T022 [US1] Populate `specs/002-api-discovery/contracts/openapi.yaml` `paths` with one path operation per Endpoint Entry from T016–T019 (`EP-001` through `EP-018`). Each operation MUST carry these custom extensions per research.md R5: `x-classification` (`derived` for every entry at this audit-commit), `x-source-citation` (string from the markdown entry), `x-phase3-grounding-note` (string from the markdown entry; required because all are derived), and where applicable `x-frontend-operation` and `x-frontend-flow`. Apply `security: [{ bearerAuth: [] }]` per operation when `auth_requirement` is `required`. Reference response and request bodies via `$ref` to the schemas registered in T020. Set `x-audit-commit` at the document root to the SHA captured in T002.

- [X] T023 [US1] Update `api-contract.md`'s `## Changelog` with a single entry: `### v1.0.0 (2026-04-29) — Initial Phase 1 ratification`. Bullet contents: number of endpoint entries (18), number of entities (7 including ErrorEnvelope), number of contradiction-register entries (filled in T024), audit-commit SHA from T002.

**Checkpoint US1**: `api-contract.md` has populated Audit Method, Authentication, Third-Party, Data Entities, Endpoints, and Changelog sections; `contracts/entities/*.schema.json` files exist for every entity; `contracts/openapi.yaml` mirrors the Markdown 1:1. SC-001, SC-004, SC-006, SC-007, SC-009, SC-012, SC-013, SC-014, SC-015 should pass after this checkpoint.

---

## Phase 4: User Story 2 — Coverage matrix (Priority: P2)

**Goal**: Cross-reference every Frontend Operation, every Frontend Flow, and every Data Entity against the populated endpoints, so a reviewer can mechanically verify that nothing the frontend does has been omitted.

**Independent Test**: Cross-reference table where every row resolves to either "covered by EP-xxx" or "explicitly client-only / no backend operation required" (per quickstart.md §3 receipts SC-002, SC-003, SC-004).

### Implementation for User Story 2

- [X] T024 [US2] Populate `## Frontend Operations Coverage` in `api-contract.md` per data-model.md E3. Use the table format: `| operation | kind | source_file | coverage | mapped_endpoint_id |`. Enumerate every method on `DemoContextValue` (read `frontend/src/context/DemoContext.tsx` lines 11-29 of the type definition; verify against the `useMemo` block lines 162-280). The expected rows are:
  - Context methods: `createTransaction` → `EP-003`; `cancelTransaction` → `EP-004`; `autoMatch` → `EP-010`; `confirmMatch` → `EP-005`; `confirmDeposit` → `EP-006`; `processPayouts` → `EP-007`; `openDispute` → `EP-008`; `resolveDispute` → `EP-014`; `flagRisk` → `EP-011`; `adminApprove` → `EP-012`; `adminRefund` → `EP-013`; `triggerTimeout` → `client_only` (demo control panel — no backend; cite `frontend/src/components/DemoControlPanel.tsx`); `setConfig` → `client_only` (demo configuration); `resetDemo` → `client_only` (demo control); `dismissNotification` → `client_only` (UI-only).
  - Reducer action types (read `frontend/src/context/DemoContext.tsx:30-38`): `CREATE_TX` → `EP-003`; `SET_STATUS` → covered by all status-changing endpoints (note: this is a meta-action; mark as `mapped_to_multiple` and list every status-changing EP); `CONFIRM_MATCH` → `EP-005`; `CONFIRM_DEPOSIT` → `EP-006`; `SET_CONFIG` → `client_only`; `RESET_DEMO` → `client_only`; `ADD_NOTIFICATION` → `client_only`; `DISMISS_NOTIFICATION` → `client_only`.

- [X] T025 [US2] Populate `## Frontend Flows Coverage` in `api-contract.md` per data-model.md E4. Use the table format: `| page_name | source_file | summary | operations_used | coverage | addressed_endpoint_ids |`. Enumerate the 10 page files from T005 bullet 2. Expected rows (verify each by reading the page file):
  - `LandingPage` → `no_backend_operation_required` (marketing/landing).
  - `SignupPage` → `addressed_by_endpoints: [EP-015]`.
  - `VerificationPage` → `addressed_by_endpoints: [EP-016]`.
  - `DashboardPage` → `addressed_by_endpoints: [EP-001]`.
  - `NewTransferPage` → `addressed_by_endpoints: [EP-003]` (operations_used: `createTransaction`).
  - `MatchFoundPage` → `addressed_by_endpoints: [EP-002, EP-005]` (read transaction, confirm match).
  - `AwaitingDepositPage` → `addressed_by_endpoints: [EP-002, EP-006, EP-004]` (read, confirm deposit, optional cancel).
  - `TransactionStatusPage` → `addressed_by_endpoints: [EP-002]` (passive observation; the auto-transition `Processing Payouts → Completed` arrives here per FR-019).
  - `DisputePage` → `addressed_by_endpoints: [EP-008]` (open dispute).
  - `AdminDashboardPage` → `addressed_by_endpoints: [EP-009, EP-010, EP-011, EP-012, EP-013, EP-014]`.

- [X] T026 [US2] Verify SC-002 by counting page files (`ls frontend/src/pages/*.tsx | wc -l` from repo root; expected 10) and counting rows in the Frontend Flows Coverage table (expected 10). Both counts MUST match. Record the result inline in the section as `<!-- SC-002 receipt: 10/10 pages addressed -->`.

- [X] T027 [US2] Verify SC-003 by counting `DemoContextValue` methods (from the type definition in `frontend/src/context/DemoContext.tsx`) plus reducer action `type` values (from the `Action` type lines 30-38), and counting Frontend Operations Coverage table rows. Both counts MUST match. Record the result inline as `<!-- SC-003 receipt: <N>/<N> operations addressed -->`.

- [X] T028 [US2] Verify SC-004 by counting Data Entities subsections in `api-contract.md` (T006) and counting `*.schema.json` files in `specs/002-api-discovery/contracts/entities/` (T007–T013). The schema-file count MUST equal entities-with-non-null-source-file count (the `ErrorEnvelope` is derived but still has its own schema). Record `<!-- SC-004 receipt: <N>/<N> entities documented -->`.

**Checkpoint US2**: Coverage tables populated; SC-002, SC-003, SC-004 receipts recorded.

---

## Phase 5: User Story 3 — Contradiction Register and Phase 3 grounding (Priority: P3)

**Goal**: Surface every place where the frontend's current behavior cannot, by itself, ground a contract test under constitution Principle III. Each entry names affected endpoints, the principle implicated, the recommended owner, and a recommended path forward.

**Independent Test**: Filter `api-contract.md` for `classification: derived` entries; for each, the `phase3_grounding_note` resolves to either (a) "treat the local state operation as the de-facto contract" or (b) a corresponding `## Contradiction Register` entry.

### Implementation for User Story 3

- [X] T029 [US3] Populate `## Contradiction Register` in `api-contract.md` per data-model.md E7. The register MUST be present even if empty; an empty register MUST state "No contradictions detected at audit time" explicitly (SC-008). Expected entries at audit-commit (each with id, affected_endpoint_ids, principle_implicated, description, recommended_owner, recommended_path_forward):
  - `CR-001` — All 18 endpoint entries are classified `derived` because the frontend issues 0 HTTP requests at audit-commit. Principle implicated: III. Affected: `EP-001` … `EP-018`. Recommended owner: `phase_2` (decide whether to wire the frontend during Phase 2 or proceed against the de-facto contract). Recommended path forward: Phase 2's plan must record an explicit decision: (a) modify the frontend to issue these requests so they become observed (which would require a Principle I exception or a constitution amendment), OR (b) proceed with derived contract tests under a written Principle III dispensation, OR (c) gate Phase 3 contract testing until the frontend is wired. The register surfaces the choice; it does NOT make it.
  - `CR-002` — `EP-017 POST /auth/login` and `EP-018 POST /auth/logout` are derived from the FR-010 auth recommendation, not from any frontend behavior (the frontend does not call these endpoints at audit-commit and `User` is never populated by an HTTP call). Principle implicated: III. Affected: `EP-017`, `EP-018`. Recommended owner: `phase_6`. Recommended path forward: defer auth contract tests until the frontend wires login, OR Phase 6 owns a constitution amendment that permits "derived from explicit recommendation" as a valid Principle III source.
  - `CR-003` — `id_origin_candidates` is intentionally unresolved on `EP-003`, `EP-015`. Principle implicated: I (frontend defines the contract; today the frontend produces IDs client-side via `nextTxId` for `Transaction`, but no HTTP call exists yet that proves whether the eventual server will accept a client-supplied ID or generate its own). Affected: `EP-003`, `EP-015`. Recommended owner: `phase_2`. Recommended path forward: Phase 2's plan picks one ID-origin position per entity per FR-018; until then, both candidates remain valid.

- [X] T030 [US3] Verify SC-008 by ensuring `## Contradiction Register` is non-empty and every `affected_endpoint_ids` value resolves to a real Endpoint Entry id from T016–T019. Record `<!-- SC-008 receipt: <N> contradictions registered, all referenced EP ids exist -->`.

**Checkpoint US3**: Contradiction Register populated with the three known constitution-vs-reality gaps; reviewers can see the full Phase 3 risk surface in one section.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across the deliverable. No new content beyond what the prior phases produced.

- [X] T031 [P] Tick every item in `specs/002-api-discovery/checklists/requirements.md` after re-verifying. Each `[x]` item MUST be defensible by pointing at a section of `api-contract.md` or a successful SC receipt from T026–T030.

- [X] T032 [P] Run SC-009 verification: from repo root, run a case-insensitive grep over `specs/002-api-discovery/api-contract.md`, `specs/002-api-discovery/contracts/openapi.yaml`, and `specs/002-api-discovery/contracts/entities/*.schema.json` for the strings: `Laravel`, `PHP`, `Sanctum`, `Passport`, `Eloquent`, `MySQL`, `Postgres`, `MariaDB`, `SQLite`, `Redis`, `composer`, `artisan`. Expected: 0 matches. If any match, edit the file to remove the leak and re-run.

- [X] T033 [P] Run SC-010 verification: from repo root run `git diff --stat -- frontend/`. Expected: empty (zero lines changed). If non-empty, abort and revert; the constitution forbids any frontend modification (Principle I).

- [X] T034 Run SC-011 verification: confirm `api-contract.md` has a `**Version**: v1.0.0` line in the metadata block and at least one entry in `## Changelog`. Confirm `contracts/openapi.yaml` has `info.version: "1.0.0"` and `x-last-updated: "2026-04-29"`.

- [X] T035 [P] Run OpenAPI structural validation: `npx -y @apidevtools/swagger-cli@latest validate specs/002-api-discovery/contracts/openapi.yaml`. Expected exit code: 0 with "is valid" output. If validation fails, fix the YAML and re-run. This is a structural smoke test; it does NOT replace Phase 3's contract tests.

- [X] T036 Walk through `specs/002-api-discovery/quickstart.md` end-to-end as if you were a new reviewer. For sections §2 (spot-check) and §3 (coverage receipt), pick three random EP entries and three pages and run the procedure. Confirm every step passes. Record the walkthrough date and reviewer in a one-line note at the bottom of `quickstart.md` (e.g., `<!-- Phase 1 exit walkthrough: 2026-04-29, mahmoud -->`).

- [X] T037 Final exit gate: re-evaluate the Constitution Check in `plan.md` and confirm both gates (initial pre-research and post-design) still PASS. Then update `specs/002-api-discovery/spec.md` `Status:` line from `Draft` to `Ratified` (one-character edit). Phase 1 is exit-ready when T037 passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies; can start immediately.
- **Phase 2 (Foundational)**: depends on Phase 1; BLOCKS all user stories.
- **Phase 3 (US1)**: depends on Phase 2 (audit findings + skeleton must exist).
- **Phase 4 (US2)**: depends on Phase 3 (coverage tables reference EP ids written in US1).
- **Phase 5 (US3)**: depends on Phase 3 (contradiction register references EP ids written in US1; can run in parallel with Phase 4 since it touches a different section).
- **Phase 6 (Polish)**: depends on US1, US2, US3 all complete.

### Within User Story 1

- T006 (Data Entities section) MUST precede T007–T013 (per-entity JSON Schemas reference the field breakdowns) and T020 (OpenAPI components.schemas references the entity files).
- T007–T013 (entity schemas) can run in parallel — different files.
- T015 (Authentication section + recommendation) MUST precede T019 (auth endpoint entries reference the recommendation) and T021 (OpenAPI securitySchemes mirrors the recommendation).
- T016–T019 (endpoint entries in markdown) MUST precede T022 (OpenAPI paths mirror them).
- T023 (changelog) is last in US1 because it counts what was produced.

### Within User Story 2

- T024, T025 can be written in parallel if discipline holds (different sections of the same file). For a cheaper LLM, treat them as sequential to avoid edit conflicts.
- T026, T027, T028 (SC verifications) MUST come after their respective coverage tables.

### Parallel opportunities

- T007 through T013 — entity schemas — different files, all parallelizable.
- T031, T032, T033, T035 in Phase 6 — independent checks against different files; all parallelizable.
- Phase 4 (US2) and Phase 5 (US3) can run in parallel after Phase 3 completes.

---

## Parallel example: User Story 1 entity schemas

```bash
# After T006 (Data Entities section populated), launch the seven entity
# schema files in parallel:
Task: "T007 Create User.schema.json from data-model.md E5 + api-contract.md User subsection"
Task: "T008 Create Transaction.schema.json from api-contract.md Transaction subsection"
Task: "T009 Create TxStatus.schema.json"
Task: "T010 Create NotificationItem.schema.json"
Task: "T011 Create AuditLogEntry.schema.json"
Task: "T012 Create DemoConfig.schema.json"
Task: "T013 Create ErrorEnvelope.schema.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup (T001–T003).
2. Complete Phase 2: Foundational (T004–T005). The audit findings note is the MVP's source-of-truth artefact.
3. Complete Phase 3: User Story 1 (T006–T023). At this point `api-contract.md` carries every endpoint, every entity, every third-party note, and the auth recommendation; `contracts/openapi.yaml` mirrors them; and the entity schemas exist. Phase 2 of the backend (Backend Foundation) could start against this MVP.
4. **STOP and VALIDATE**: pick three EP entries at random, follow each `source_citation` to the named frontend file/symbol, and confirm corroboration in under one minute (SC-005). If any spot-check fails, fix before proceeding.

### Incremental delivery

1. MVP (US1) → review → optionally close Phase 1 here if US2 and US3 are deferred to a later cycle.
2. Add US2 (coverage matrix) → reviewers can mechanically verify nothing was omitted.
3. Add US3 (contradiction register) → constitution-vs-reality gaps surfaced in writing.
4. Phase 6 polish → exit.

### Single-implementor strategy (most likely for a cheaper LLM)

Run tasks strictly in order T001 → T037. Mark each `[ ]` as `[x]` after the task is complete and verified. Do not skip ahead; later tasks depend on earlier tasks' outputs.

---

## Notes

- This is a documentation-only feature. "Implementation" means writing well-cited Markdown, YAML, and JSON files; there is no compiled output and no runtime test suite.
- The constitution prohibits modifying any file under `frontend/` (Principle I; spec FR-016 / SC-010). T033 verifies this at exit.
- The deliverable stays wire-level only (FR-011 / SC-009). T032 verifies this at exit.
- Every endpoint entry is `classification: derived` at audit-commit because the frontend issues zero HTTP requests today (T005 finding). When the frontend later wires HTTP, individual entries can be reclassified `observed` and the changelog gets a MINOR bump per research.md R4.
- Commit after each completed task or each logical group (e.g., after T013, after T019, after T023, after T030, after T037). The repo's `after_implement` hook is `/speckit-git-commit` (optional).
- Stop at any checkpoint to validate the story independently before continuing.
- Avoid: vague descriptions ("see the frontend"), missing source citations, leaking backend implementation choices into the deliverable, modifying any frontend file.
