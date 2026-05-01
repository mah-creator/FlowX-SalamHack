# API Contract - Salamhack Backend (Phase 1 Discovery)

**Version**: v1.0.0
**Last-Updated**: 2026-04-29
**Audit-Commit**: 6f29646
**Status**: Draft (populated by /speckit-implement)

## Changelog

### v1.0.0 (2026-04-29) - Initial Phase 1 ratification

- Endpoint entries: 18 (`EP-001` through `EP-018`).
- Data entities: 7 including `ErrorEnvelope`.
- Contradiction-register entries: 3 (`CR-001` through `CR-003`).
- Audit commit: `6f29646`.

## Audit Method & Findings

### Audit method

1. **HTTP-call grep**: search `frontend/src/` for the patterns `fetch\(`, `axios`, `XMLHttpRequest`, `ky\(`, `got\(`, and any `import.meta.env.VITE_*_URL` style API base-URL configuration. Record the result. Initial sweep on 2026-04-29 returned **zero matches** in `frontend/src/`; this is the audit's headline finding.
2. **Page-level flow enumeration**: list every `*.tsx` under `frontend/src/pages/` and walk each page's hooks/state usage to identify implied backend operations.
3. **State-module enumeration**: walk every method on `DemoContextValue` in `frontend/src/context/DemoContext.tsx` and every reducer action `type` it dispatches in `frontend/src/lib/demoStore.ts`. Map each item to one endpoint entry or to an explicit "client-only" note.
4. **Entity enumeration**: walk every typed export from `frontend/src/types.ts` and every type/constant exported from `frontend/src/lib/demoStore.ts` (`Transaction`, `TxStatus`, `DEMO_CONFIG`, `DEMO_USERS`, `NotificationItem`, `User`, the audit log entry type, etc.). Record each as a Data Entity in the deliverable.
5. **Third-party enumeration**: read `frontend/package.json` `dependencies` and `devDependencies` and produce the Third-Party Integrations section per FR-017. For each declared SDK, repeat step 1's grep with the SDK's import name (`@google/genai`, `GoogleGenAI`, etc.) to confirm whether it is invoked from `frontend/src/`.
6. **Audit-method note**: copy this procedure verbatim into a section of `api-contract.md` so reviewers can reproduce it.

### Findings

- HTTP-call grep result: 0 matches in `frontend/src/` for `fetch\(|axios|XMLHttpRequest|ky\(|got\(|VITE_.*_URL|process\.env\..*_URL`.
- Page enumeration: 10 page files found: `frontend/src/pages/AdminDashboardPage.tsx`, `frontend/src/pages/AwaitingDepositPage.tsx`, `frontend/src/pages/DashboardPage.tsx`, `frontend/src/pages/DisputePage.tsx`, `frontend/src/pages/LandingPage.tsx`, `frontend/src/pages/MatchFoundPage.tsx`, `frontend/src/pages/NewTransferPage.tsx`, `frontend/src/pages/SignupPage.tsx`, `frontend/src/pages/TransactionStatusPage.tsx`, `frontend/src/pages/VerificationPage.tsx`.
- Third-party SDK enumeration: `@google/genai` at `^1.29.0` in `frontend/package.json`; env wiring is `process.env.GEMINI_API_KEY` in `frontend/vite.config.ts:11`; no invocation from `frontend/src/`.

## Authentication

### Audit

- Authorization header construction: 0 observed matches in `frontend/src/`.
- Credential token storage: 0 observed `localStorage.setItem` or `sessionStorage.setItem` credential writes in `frontend/src/`.
- Login API call: 0 observed HTTP calls; `frontend/src/pages/SignupPage.tsx` switches signup/login UI modes and navigates locally after submit.
- Cookie reads: 0 observed cookie reads in `frontend/src/`.
- User shape exists at `frontend/src/types.ts:12-17`, but no HTTP call populates it.
- Signup and verification flows are UI-only at audit time: `frontend/src/pages/SignupPage.tsx` and `frontend/src/pages/VerificationPage.tsx`.

### Recommendation

- `x-classification`: `derived`
- `auth_scheme`: bearer token in `Authorization: Bearer <token>`.
- `credential_format`: opaque token string returned by login/signup.
- `implied_endpoints`: `POST /auth/signup`, `POST /auth/verify`, `POST /auth/login`, `POST /auth/logout`.
- `unauthenticated_error`: `401 { "error": { "code": "unauthenticated", "message": "Authentication is required." } }`
- `unauthorized_error`: `403 { "error": { "code": "forbidden", "message": "The authenticated user cannot perform this action." } }`
- `phase3_grounding_note`: no current frontend behavior grounds this; Phase 3 will defer authentication contract tests until the frontend wires login, OR Phase 2 may treat the recommended envelope as the de-facto contract pending a Principle III amendment.

## Third-Party Integrations

| SDK name | Version range | Env-var wiring | Invocation status | Endpoint-entry rule |
|---|---:|---|---|---|
| `@google/genai` | `^1.29.0` | `GEMINI_API_KEY` exposed as `process.env.GEMINI_API_KEY` in `frontend/vite.config.ts:11` | declared but not invoked from `frontend/src/` | excluded from endpoint entries unless invoked from `frontend/src/` |

## Data Entities

### User

- `source_citation`: `frontend/src/types.ts:12-17`
- `id_field_name`: null
- `id_origin_observed`: null
- `drift_notes`: none
- `schema_file`: `specs/002-api-discovery/contracts/entities/User.schema.json`

| name | type | required | allowed values | example |
|---|---|---:|---|---|
| `fullName` | string | yes | any string | `"Tariq J."` |
| `email` | string | yes | email string | `"tariq@example.com"` |
| `accountType` | string enum | yes | `Individual`, `Business` | `"Individual"` |
| `verified` | boolean | yes | `true`, `false` | `true` |

### Transaction

- `source_citation`: `frontend/src/lib/demoStore.ts:14-29`
- `id_field_name`: `id`
- `id_origin_observed`: client-side via `nextTxId(state.transactions.length)` producing `TR-####` strings; cite `frontend/src/lib/demoStore.ts#nextTxId` and `frontend/src/context/DemoContext.tsx:60-62`
- `drift_notes`: none
- `schema_file`: `specs/002-api-discovery/contracts/entities/Transaction.schema.json`

| name | type | required | allowed values | example |
|---|---|---:|---|---|
| `id` | string | yes | `TR-####` observed | `"TR-8924"` |
| `source` | string enum | yes | `Gaza`, `Egypt` | `"Gaza"` |
| `destination` | string enum | yes | `Gaza`, `Egypt` | `"Egypt"` |
| `amount` | number | yes | numeric amount | `750` |
| `currency` | string enum | yes | `USD`, `EGP`, `ILS` | `"USD"` |
| `status` | `TxStatus` | yes | see `TxStatus` | `"Pending Request"` |
| `feePercent` | number | yes | numeric percent | `2` |
| `exchangeRate` | number | yes | numeric rate | `1.0` |
| `receivableAmount` | number | yes | numeric amount | `735` |
| `createdAt` | string date-time | yes | ISO string | `"2026-04-29T00:00:00.000Z"` |
| `depositA` | boolean | yes | `true`, `false` | `false` |
| `depositB` | boolean | yes | `true`, `false` | `false` |
| `disputeReason` | string | no | any string | `"Payment delayed"` |
| `auditLog` | `AuditLogEntry[]` | yes | array | `[]` |

### TxStatus

- `source_citation`: `frontend/src/lib/demoStore.ts:1-12`
- `id_field_name`: null
- `id_origin_observed`: null
- `drift_notes`: none
- `schema_file`: `specs/002-api-discovery/contracts/entities/TxStatus.schema.json`

| name | type | required | allowed values | example |
|---|---|---:|---|---|
| `value` | string enum | yes | `Pending Request`, `Match Found`, `Awaiting Deposits`, `Deposit Confirmed Partially`, `Both Deposits Confirmed`, `Processing Payouts`, `Completed`, `Under Review`, `Failed`, `Refunded`, `Disputed` | `"Match Found"` |

### NotificationItem

- `source_citation`: `frontend/src/lib/demoStore.ts:43-46`
- `id_field_name`: `id`
- `id_origin_observed`: client-side via `crypto.randomUUID()`; cite `frontend/src/context/DemoContext.tsx:67`
- `drift_notes`: none
- `schema_file`: `specs/002-api-discovery/contracts/entities/NotificationItem.schema.json`

| name | type | required | allowed values | example |
|---|---|---:|---|---|
| `id` | string uuid | yes | UUID | `"7f4f2c2a-8a9b-4ef1-9b41-111111111111"` |
| `message` | string | yes | any string | `"Request created"` |

### AuditLogEntry

- `source_citation`: `frontend/src/lib/demoStore.ts:28`
- `id_field_name`: null
- `id_origin_observed`: null
- `drift_notes`: none
- `schema_file`: `specs/002-api-discovery/contracts/entities/AuditLogEntry.schema.json`

| name | type | required | allowed values | example |
|---|---|---:|---|---|
| `time` | string date-time | yes | ISO string | `"2026-04-29T00:00:00.000Z"` |
| `actor` | string | yes | any string | `"Tariq J."` |
| `action` | string | yes | any string | `"Request created"` |

### DemoConfig

- `source_citation`: `frontend/src/lib/demoStore.ts:31-36`
- `id_field_name`: null
- `id_origin_observed`: null
- `drift_notes`: configuration entity, candidate for backend `GET /config` (derived)
- `schema_file`: `specs/002-api-discovery/contracts/entities/DemoConfig.schema.json`

| name | type | required | allowed values | example |
|---|---|---:|---|---|
| `feePercent` | number | yes | numeric percent | `2` |
| `exchangeRate` | number | yes | numeric rate | `1.0` |
| `rateLockMinutes` | number | yes | numeric minutes | `15` |
| `paymentWindowMinutes` | number | yes | numeric minutes | `30` |

### ErrorEnvelope

- `classification`: `derived`
- `source_citation`: `derived from auth recommendation (FR-010(b))`
- `phase3_grounding_note`: no observed error response today; treat the recommended envelope as the de-facto contract until the frontend issues a request that surfaces an error.
- `id_field_name`: null
- `id_origin_observed`: null
- `drift_notes`: no observed HTTP error payload exists at audit time
- `schema_file`: `specs/002-api-discovery/contracts/entities/ErrorEnvelope.schema.json`

| name | type | required | allowed values | example |
|---|---|---:|---|---|
| `error` | object | yes | object with `code`, `message`, optional `details` | `{ "code": "unauthenticated", "message": "Authentication is required." }` |
| `error.code` | string | yes | any stable machine code | `"unauthenticated"` |
| `error.message` | string | yes | human-readable string | `"Authentication is required."` |
| `error.details` | object | no | object | `{}` |

## Endpoints

All entries at audit commit `6f29646` are `classification: derived` because the frontend issues zero HTTP requests.

### EP-001 - GET /transactions

- `id`: `EP-001`
- `method`: `GET`
- `path`: `/transactions`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Accept: application/json` required
- `request_body_shape`: null
- `response_body_shape`: `{ "transactions": Transaction[] }`
- `status_codes`: `200` success, `401` unauthenticated
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/pages/DashboardPage.tsx`
- `phase3_grounding_note`: Treat the dashboard transaction list as the de-facto read contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call, at which point this entry will be reclassified observed and re-grounded against the captured request.
- `frontend_operation`: null
- `frontend_flow`: `DashboardPage`
- `status_side_effects`: none
- `id_origin_candidates`: N/A

### EP-002 - GET /transactions/{id}

- `id`: `EP-002`
- `method`: `GET`
- `path`: `/transactions/{id}`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Accept: application/json` required
- `request_body_shape`: null
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `401` unauthenticated, `403` forbidden, `404` not found
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/pages/TransactionStatusPage.tsx`
- `phase3_grounding_note`: Treat active transaction page reads as the de-facto contract; this endpoint is the channel through which auto-transitions such as `Processing Payouts` to `Completed` after `setTimeout` in `frontend/src/context/DemoContext.tsx:210-219` become observable.
- `frontend_operation`: null
- `frontend_flow`: `TransactionStatusPage`, `AwaitingDepositPage`, `MatchFoundPage`, `DisputePage`
- `status_side_effects`: observes server-side status changes, including `Processing Payouts` to `Completed`
- `id_origin_candidates`: N/A

### EP-003 - POST /transactions

- `id`: `EP-003`
- `method`: `POST`
- `path`: `/transactions`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: `{ "amount": number, "currency": "USD" | "EGP" | "ILS" }`
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `201` created, `400` validation error, `401` unauthenticated
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:168-170`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call, at which point this entry will be reclassified observed and re-grounded against the captured request.
- `frontend_operation`: `createTransaction`
- `frontend_flow`: `NewTransferPage`
- `status_side_effects`: creates with `status: "Pending Request"`
- `id_origin_candidates`: `server-issued`, `client-supplied`, `either`

### EP-004 - POST /transactions/{id}/cancel

- `id`: `EP-004`
- `method`: `POST`
- `path`: `/transactions/{id}/cancel`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: empty object
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:171-184`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `cancelTransaction`
- `frontend_flow`: `AwaitingDepositPage`
- `status_side_effects`: `Pending Request` or `Match Found` to `Failed`
- `id_origin_candidates`: N/A

### EP-005 - POST /transactions/{id}/confirm-match

- `id`: `EP-005`
- `method`: `POST`
- `path`: `/transactions/{id}/confirm-match`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: empty object
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:191-193`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `confirmMatch`
- `frontend_flow`: `MatchFoundPage`
- `status_side_effects`: `Match Found` to `Awaiting Deposits`
- `id_origin_candidates`: N/A

### EP-006 - POST /transactions/{id}/deposits

- `id`: `EP-006`
- `method`: `POST`
- `path`: `/transactions/{id}/deposits`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: `{ "party": "A" | "B" }`
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `400` validation error, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:194-196`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `confirmDeposit`
- `frontend_flow`: `AwaitingDepositPage`
- `status_side_effects`: one party confirmed to `Deposit Confirmed Partially`; both parties confirmed to `Both Deposits Confirmed`
- `id_origin_candidates`: N/A

### EP-007 - POST /transactions/{id}/process-payouts

- `id`: `EP-007`
- `method`: `POST`
- `path`: `/transactions/{id}/process-payouts`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: empty object
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:197-219`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `processPayouts`
- `frontend_flow`: `TransactionStatusPage`
- `status_side_effects`: `Both Deposits Confirmed` to `Processing Payouts`, then `Completed`
- `id_origin_candidates`: N/A

### EP-008 - POST /transactions/{id}/disputes

- `id`: `EP-008`
- `method`: `POST`
- `path`: `/transactions/{id}/disputes`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: `{ "reason": string }`
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `400` validation error, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:220-226`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `openDispute`
- `frontend_flow`: `DisputePage`
- `status_side_effects`: any active transaction state to `Disputed`
- `id_origin_candidates`: N/A

### EP-009 - GET /admin/transactions

- `id`: `EP-009`
- `method`: `GET`
- `path`: `/admin/transactions`
- `query_parameters`: optional `status` string
- `request_headers`: `Authorization: Bearer <token>` required; `Accept: application/json` required
- `request_body_shape`: null
- `response_body_shape`: `{ "transactions": Transaction[] }`
- `status_codes`: `200` success, `401` unauthenticated, `403` forbidden
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/pages/AdminDashboardPage.tsx`
- `phase3_grounding_note`: Treat the admin dashboard transaction list as the de-facto contract until the frontend wires an admin read call.
- `frontend_operation`: null
- `frontend_flow`: `AdminDashboardPage`
- `status_side_effects`: none
- `id_origin_candidates`: N/A

### EP-010 - POST /transactions/{id}/auto-match

- `id`: `EP-010`
- `method`: `POST`
- `path`: `/transactions/{id}/auto-match`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: empty object
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:185-190`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `autoMatch`
- `frontend_flow`: `NewTransferPage`, `AdminDashboardPage`
- `status_side_effects`: `Pending Request` to `Match Found`
- `id_origin_candidates`: N/A

### EP-011 - POST /admin/transactions/{id}/flag-risk

- `id`: `EP-011`
- `method`: `POST`
- `path`: `/admin/transactions/{id}/flag-risk`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: empty object
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:237-242`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `flagRisk`
- `frontend_flow`: `AdminDashboardPage`
- `status_side_effects`: active transaction to `Under Review`
- `id_origin_candidates`: N/A

### EP-012 - POST /admin/transactions/{id}/approve

- `id`: `EP-012`
- `method`: `POST`
- `path`: `/admin/transactions/{id}/approve`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: empty object
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:243-251`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `adminApprove`
- `frontend_flow`: `AdminDashboardPage`
- `status_side_effects`: `Under Review` to `Both Deposits Confirmed`
- `id_origin_candidates`: N/A

### EP-013 - POST /admin/transactions/{id}/refund

- `id`: `EP-013`
- `method`: `POST`
- `path`: `/admin/transactions/{id}/refund`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: empty object
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:252-257`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `adminRefund`
- `frontend_flow`: `AdminDashboardPage`
- `status_side_effects`: active transaction to `Refunded`
- `id_origin_candidates`: N/A

### EP-014 - POST /admin/transactions/{id}/resolve-dispute

- `id`: `EP-014`
- `method`: `POST`
- `path`: `/admin/transactions/{id}/resolve-dispute`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: `{ "outcome": "Completed" | "Refunded" }`
- `response_body_shape`: `Transaction.schema.json`
- `status_codes`: `200` success, `400` validation error, `401` unauthenticated, `403` forbidden, `404` not found, `409` invalid state
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/context/DemoContext.tsx:227-236`
- `phase3_grounding_note`: Treat the named `DemoContextValue` method and its reducer action as the de-facto contract; Phase 3 will assert this shape until the frontend wires the actual HTTP call.
- `frontend_operation`: `resolveDispute`
- `frontend_flow`: `AdminDashboardPage`
- `status_side_effects`: `Disputed` to `Completed` or `Refunded`
- `id_origin_candidates`: N/A

### EP-015 - POST /auth/signup

- `id`: `EP-015`
- `method`: `POST`
- `path`: `/auth/signup`
- `query_parameters`: none
- `request_headers`: `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: `{ "fullName": string, "email": string, "accountType": "Individual" | "Business", "password": string }`
- `response_body_shape`: `{ "user": User, "token": string }`
- `status_codes`: `201` created, `400` validation error, `409` email taken
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: none
- `classification`: derived
- `source_citation`: `frontend/src/pages/SignupPage.tsx` plus `frontend/src/types.ts:12-17`
- `phase3_grounding_note`: no current frontend behavior grounds this; defer until the frontend wires signup OR Phase 2 treats the recommended envelope as the de-facto contract under a Principle III amendment.
- `frontend_operation`: null
- `frontend_flow`: `SignupPage`
- `status_side_effects`: none
- `id_origin_candidates`: `server-issued`, `client-supplied`, `either`

### EP-016 - POST /auth/verify

- `id`: `EP-016`
- `method`: `POST`
- `path`: `/auth/verify`
- `query_parameters`: none
- `request_headers`: `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: `{ "documentType": "id" | "travel_document", "documentFile": file, "selfieFile": file }`; the current UI implies document upload rather than a numeric code.
- `response_body_shape`: `{ "user": User }`
- `status_codes`: `200` verified, `400` validation error, `401` unauthenticated
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `frontend/src/pages/VerificationPage.tsx`
- `phase3_grounding_note`: no current frontend behavior grounds this; defer until the frontend wires verification OR Phase 2 treats the recommended envelope as the de-facto contract under a Principle III amendment.
- `frontend_operation`: null
- `frontend_flow`: `VerificationPage`
- `status_side_effects`: sets user `verified` to `true`
- `id_origin_candidates`: N/A

### EP-017 - POST /auth/login

- `id`: `EP-017`
- `method`: `POST`
- `path`: `/auth/login`
- `query_parameters`: none
- `request_headers`: `Content-Type: application/json` required; `Accept: application/json` required
- `request_body_shape`: `{ "email": string, "password": string }`
- `response_body_shape`: `{ "user": User, "token": string }`
- `status_codes`: `200` success, `400` validation error, `401` unauthenticated
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: none
- `classification`: derived
- `source_citation`: `derived from FR-010(b) auth recommendation`
- `phase3_grounding_note`: no current frontend behavior grounds this; deferred until the frontend wires login OR Phase 2 treats the recommended envelope as the de-facto contract under a Principle III amendment. See `CR-002`.
- `frontend_operation`: null
- `frontend_flow`: `SignupPage`
- `status_side_effects`: none
- `id_origin_candidates`: N/A

### EP-018 - POST /auth/logout

- `id`: `EP-018`
- `method`: `POST`
- `path`: `/auth/logout`
- `query_parameters`: none
- `request_headers`: `Authorization: Bearer <token>` required; `Accept: application/json` required
- `request_body_shape`: empty object
- `response_body_shape`: empty response
- `status_codes`: `204` no content, `401` unauthenticated
- `error_envelope`: `ErrorEnvelope.schema.json`
- `auth_requirement`: required
- `classification`: derived
- `source_citation`: `derived from FR-010(b) auth recommendation`
- `phase3_grounding_note`: no current frontend behavior grounds this; deferred until the frontend wires login OR Phase 2 treats the recommended envelope as the de-facto contract under a Principle III amendment. See `CR-002`.
- `frontend_operation`: null
- `frontend_flow`: `SignupPage`
- `status_side_effects`: none
- `id_origin_candidates`: N/A

## Frontend Operations Coverage

| operation | kind | source_file | coverage | mapped_endpoint_id |
|---|---|---|---|---|
| `createTransaction` | context_method | `frontend/src/context/DemoContext.tsx:12` | mapped_to_endpoint | `EP-003` |
| `cancelTransaction` | context_method | `frontend/src/context/DemoContext.tsx:13` | mapped_to_endpoint | `EP-004` |
| `autoMatch` | context_method | `frontend/src/context/DemoContext.tsx:14` | mapped_to_endpoint | `EP-010` |
| `confirmMatch` | context_method | `frontend/src/context/DemoContext.tsx:15` | mapped_to_endpoint | `EP-005` |
| `confirmDeposit` | context_method | `frontend/src/context/DemoContext.tsx:16` | mapped_to_endpoint | `EP-006` |
| `processPayouts` | context_method | `frontend/src/context/DemoContext.tsx:17` | mapped_to_endpoint | `EP-007` |
| `openDispute` | context_method | `frontend/src/context/DemoContext.tsx:18` | mapped_to_endpoint | `EP-008` |
| `resolveDispute` | context_method | `frontend/src/context/DemoContext.tsx:19` | mapped_to_endpoint | `EP-014` |
| `flagRisk` | context_method | `frontend/src/context/DemoContext.tsx:20` | mapped_to_endpoint | `EP-011` |
| `adminApprove` | context_method | `frontend/src/context/DemoContext.tsx:21` | mapped_to_endpoint | `EP-012` |
| `adminRefund` | context_method | `frontend/src/context/DemoContext.tsx:22` | mapped_to_endpoint | `EP-013` |
| `triggerTimeout` | context_method | `frontend/src/context/DemoContext.tsx:23` | client_only | demo control panel; no backend operation required |
| `setConfig` | context_method | `frontend/src/context/DemoContext.tsx:24` | client_only | demo configuration |
| `resetDemo` | context_method | `frontend/src/context/DemoContext.tsx:25` | client_only | demo control |
| `dismissNotification` | context_method | `frontend/src/context/DemoContext.tsx:26` | client_only | UI-only |
| `CREATE_TX` | reducer_action | `frontend/src/context/DemoContext.tsx:30` | mapped_to_endpoint | `EP-003` |
| `SET_STATUS` | reducer_action | `frontend/src/context/DemoContext.tsx:31` | mapped_to_multiple | `EP-004`, `EP-007`, `EP-008`, `EP-010`, `EP-011`, `EP-012`, `EP-013`, `EP-014` |
| `CONFIRM_MATCH` | reducer_action | `frontend/src/context/DemoContext.tsx:32` | mapped_to_endpoint | `EP-005` |
| `CONFIRM_DEPOSIT` | reducer_action | `frontend/src/context/DemoContext.tsx:33` | mapped_to_endpoint | `EP-006` |
| `SET_CONFIG` | reducer_action | `frontend/src/context/DemoContext.tsx:34` | client_only | demo configuration |
| `RESET_DEMO` | reducer_action | `frontend/src/context/DemoContext.tsx:35` | client_only | demo control |
| `ADD_NOTIFICATION` | reducer_action | `frontend/src/context/DemoContext.tsx:36` | client_only | UI-only notification |
| `DISMISS_NOTIFICATION` | reducer_action | `frontend/src/context/DemoContext.tsx:37` | client_only | UI-only notification dismissal |

<!-- SC-003 receipt: 23/23 operations addressed -->
<!-- SC-004 receipt: 7/7 entities documented -->

## Frontend Flows Coverage

| page_name | source_file | summary | operations_used | coverage | addressed_endpoint_ids |
|---|---|---|---|---|---|
| `AdminDashboardPage` | `frontend/src/pages/AdminDashboardPage.tsx` | Admin review and transaction operations surface. | `setConfig`, `resetDemo`, `resolveDispute`, `adminApprove`, `adminRefund` | addressed_by_endpoints | `EP-009`, `EP-010`, `EP-011`, `EP-012`, `EP-013`, `EP-014` |
| `AwaitingDepositPage` | `frontend/src/pages/AwaitingDepositPage.tsx` | Deposit confirmation and transaction observation. | `confirmDeposit`, `triggerTimeout` | addressed_by_endpoints | `EP-002`, `EP-006`, `EP-004` |
| `DashboardPage` | `frontend/src/pages/DashboardPage.tsx` | Transaction list dashboard. | transaction state read | addressed_by_endpoints | `EP-001` |
| `DisputePage` | `frontend/src/pages/DisputePage.tsx` | Opens a dispute against the active transaction. | `openDispute` | addressed_by_endpoints | `EP-008` |
| `LandingPage` | `frontend/src/pages/LandingPage.tsx` | Marketing and product overview. | none | no_backend_operation_required | none |
| `MatchFoundPage` | `frontend/src/pages/MatchFoundPage.tsx` | Shows matched transaction and lets user confirm. | `confirmMatch` | addressed_by_endpoints | `EP-002`, `EP-005` |
| `NewTransferPage` | `frontend/src/pages/NewTransferPage.tsx` | Creates a transfer request and starts matching. | `createTransaction`, `autoMatch` | addressed_by_endpoints | `EP-003`, `EP-010` |
| `SignupPage` | `frontend/src/pages/SignupPage.tsx` | Signup/login UI flow with local navigation. | local form submit | addressed_by_endpoints | `EP-015`, `EP-017`, `EP-018` |
| `TransactionStatusPage` | `frontend/src/pages/TransactionStatusPage.tsx` | Passive transaction-status observation. | transaction state read | addressed_by_endpoints | `EP-002`, `EP-007` |
| `VerificationPage` | `frontend/src/pages/VerificationPage.tsx` | Identity verification upload flow. | local document state | addressed_by_endpoints | `EP-016` |

<!-- SC-002 receipt: 10/10 pages addressed -->

## Contradiction Register

### CR-001

- `affected_endpoint_ids`: `EP-001`, `EP-002`, `EP-003`, `EP-004`, `EP-005`, `EP-006`, `EP-007`, `EP-008`, `EP-009`, `EP-010`, `EP-011`, `EP-012`, `EP-013`, `EP-014`, `EP-015`, `EP-016`, `EP-017`, `EP-018`
- `principle_implicated`: III
- `description`: All endpoint entries are classified `derived` because the frontend issues 0 HTTP requests at audit commit `6f29646`.
- `recommended_owner`: `phase_2`
- `recommended_path_forward`: Phase 2's plan must record an explicit decision: wire the frontend so requests become observed, proceed with derived contract tests under a written Principle III dispensation, or gate Phase 3 contract testing until the frontend is wired. This register surfaces the choice; it does not make it.

### CR-002

- `affected_endpoint_ids`: `EP-017`, `EP-018`
- `principle_implicated`: III
- `description`: Login and logout are derived from the FR-010 auth recommendation, not from frontend behavior; the frontend does not call these endpoints at audit time and `User` is never populated by an HTTP call.
- `recommended_owner`: `phase_6`
- `recommended_path_forward`: Defer auth contract tests until the frontend wires login, OR Phase 6 owns a constitution amendment that permits "derived from explicit recommendation" as a valid Principle III source.

### CR-003

- `affected_endpoint_ids`: `EP-003`, `EP-015`
- `principle_implicated`: I
- `description`: `id_origin_candidates` is intentionally unresolved for transaction creation and signup. Today the frontend produces transaction IDs client-side via `nextTxId`, but no HTTP call proves whether the eventual server accepts a client-supplied ID or generates its own.
- `recommended_owner`: `phase_2`
- `recommended_path_forward`: Phase 2's plan picks one ID-origin position per entity per FR-018; until then, both candidates remain valid.

<!-- SC-008 receipt: 3 contradictions registered, all referenced EP ids exist -->
