# Route Registry — Backend Foundation (Phase 2)

**Version**: v1.0.0
**Last-Updated**: 2026-04-29
**Status**: Implementation-verified by `/speckit-implement`

This artefact is the Phase 2 deliverable required by spec FR-017 and
SC-002: a checked-in mapping from each Phase 1 endpoint ID to its
Laravel route registration. A reviewer can verify that every Phase 1
endpoint is registered by reading this file alone, without running
the server.

The 18 Phase 1 routes inherit their `Method`, `Path`, `Auth`, and
`Phase 1 Source` directly from
`specs/002-api-discovery/api-contract.md`. Phase 2 adds three columns:
`Controller@Action` (Laravel binding), `Stub Response` (uniform per
research.md R-010), and a stable controller-action assignment.

All 18 stub endpoints return:

```http
HTTP/1.1 501 Not Implemented
Content-Type: application/json

{
  "error": {
    "code": "not_implemented",
    "message": "This endpoint is registered but not yet implemented (Phase 2 stub).",
    "details": { "endpoint_id": "EP-XXX" }
  }
}
```

The `Stub Response` column below is therefore abbreviated as
`501 not_implemented (EP-XXX)` for every Phase 1 row.

## Phase 1 endpoints (18)

| EP-ID | Method | Path | Controller@Action | Auth | Stub Response | Phase 1 Source |
|-------|--------|------|-------------------|------|---------------|----------------|
| `EP-001` | `GET`  | `/transactions`                                  | `TransactionController@index`              | required | `501 not_implemented (EP-001)` | `frontend/src/pages/DashboardPage.tsx` |
| `EP-002` | `GET`  | `/transactions/{id}`                             | `TransactionController@show`               | required | `501 not_implemented (EP-002)` | `frontend/src/pages/TransactionStatusPage.tsx` |
| `EP-003` | `POST` | `/transactions`                                  | `TransactionController@store`              | required | `501 not_implemented (EP-003)` | `frontend/src/context/DemoContext.tsx:168-170` |
| `EP-004` | `POST` | `/transactions/{id}/cancel`                      | `TransactionController@cancel`             | required | `501 not_implemented (EP-004)` | `frontend/src/context/DemoContext.tsx:171-184` |
| `EP-005` | `POST` | `/transactions/{id}/confirm-match`               | `TransactionController@confirmMatch`       | required | `501 not_implemented (EP-005)` | `frontend/src/context/DemoContext.tsx:191-193` |
| `EP-006` | `POST` | `/transactions/{id}/deposits`                    | `TransactionController@confirmDeposit`     | required | `501 not_implemented (EP-006)` | `frontend/src/context/DemoContext.tsx:194-196` |
| `EP-007` | `POST` | `/transactions/{id}/process-payouts`             | `TransactionController@processPayouts`     | required | `501 not_implemented (EP-007)` | `frontend/src/context/DemoContext.tsx:197-219` |
| `EP-008` | `POST` | `/transactions/{id}/disputes`                    | `TransactionController@openDispute`        | required | `501 not_implemented (EP-008)` | `frontend/src/context/DemoContext.tsx:220-226` |
| `EP-009` | `GET`  | `/admin/transactions`                            | `AdminTransactionController@index`         | required | `501 not_implemented (EP-009)` | `frontend/src/pages/AdminDashboardPage.tsx` |
| `EP-010` | `POST` | `/transactions/{id}/auto-match`                  | `TransactionController@autoMatch`          | required | `501 not_implemented (EP-010)` | `frontend/src/context/DemoContext.tsx:185-190` |
| `EP-011` | `POST` | `/admin/transactions/{id}/flag-risk`             | `AdminTransactionController@flagRisk`      | required | `501 not_implemented (EP-011)` | `frontend/src/context/DemoContext.tsx:237-242` |
| `EP-012` | `POST` | `/admin/transactions/{id}/approve`               | `AdminTransactionController@approve`       | required | `501 not_implemented (EP-012)` | `frontend/src/context/DemoContext.tsx:243-251` |
| `EP-013` | `POST` | `/admin/transactions/{id}/refund`                | `AdminTransactionController@refund`        | required | `501 not_implemented (EP-013)` | `frontend/src/context/DemoContext.tsx:252-257` |
| `EP-014` | `POST` | `/admin/transactions/{id}/resolve-dispute`       | `AdminTransactionController@resolveDispute`| required | `501 not_implemented (EP-014)` | `frontend/src/context/DemoContext.tsx:227-236` |
| `EP-015` | `POST` | `/auth/signup`                                   | `AuthController@signup`                    | none     | `501 not_implemented (EP-015)` | `frontend/src/pages/SignupPage.tsx` + `frontend/src/types.ts:12-17` |
| `EP-016` | `POST` | `/auth/verify`                                   | `AuthController@verify`                    | required | `501 not_implemented (EP-016)` | `frontend/src/pages/VerificationPage.tsx` |
| `EP-017` | `POST` | `/auth/login`                                    | `AuthController@login`                     | none     | `501 not_implemented (EP-017)` | derived from FR-010(b) auth recommendation |
| `EP-018` | `POST` | `/auth/logout`                                   | `AuthController@logout`                    | required | `501 not_implemented (EP-018)` | derived from FR-010(b) auth recommendation |

**Row count**: 18 (matches Phase 1 endpoint count exactly).

## Non-Phase-1 endpoints (1)

| Purpose | Method | Path | Controller@Action | Auth | Response | Source |
|---------|--------|------|-------------------|------|----------|--------|
| Health probe | `GET` | `/healthz` | `HealthController@show` | none | `200 { "status": "ok", "service": "salamhack-backend", "version": "<config('app.version')>" }` | spec FR-004; research.md R-011 |

## ID-origin policy (resolves `CR-003`)

Per spec Clarifications Q2 and FR-011, both transaction and user IDs
are **server-issued**. Phase 2 stubs do not actually issue IDs (501 +
envelope is uniform), but the request-body contract for `EP-003` and
`EP-015` is locked:

- `EP-003 POST /transactions` request body: `{ "amount": number, "currency": "USD" | "EGP" | "ILS" }`. **No `id` field accepted from the client.**
- `EP-015 POST /auth/signup` request body: `{ "fullName": string, "email": string, "accountType": "Individual" | "Business", "password": string }`. **No `id` field accepted from the client.**

Phase 4 (when stubs are replaced) MUST generate `Transaction.id` in
the `TR-####` format (Phase 1 entity definition) server-side, and a
`User.id` server-side as an opaque string (Phase 5 may pick UUID v4
or auto-increment integer; the wire shape is just "string").

## Auth middleware policy (resolves Clarifications Q4)

All rows above with `Auth: required` are registered behind the route
middleware alias `auth.bearer.presence` (research.md R-009). The
middleware:

- Returns `401 unauthenticated (canonical envelope)` when the
  `Authorization` header is absent, empty, or not in the form
  `Bearer <non-empty>`.
- Calls `$next($request)` for any non-empty Bearer value. **Token
  contents are NOT validated in Phase 2.**

Rows with `Auth: none` are registered without the middleware; the
public auth surface is `EP-015 POST /auth/signup` and `EP-017 POST
/auth/login` plus the health endpoint. (`EP-018 POST /auth/logout`
is `Auth: required` because the frontend's recommended auth scheme
puts logout behind a token, per Phase 1 EP-018.)

## Verification

A reviewer verifies this artefact end-to-end with the following
commands inside `backend/`:

```bash
# All 18 Phase 1 routes appear in the route table.
php artisan route:list --json | jq '.[] | select(.uri | startswith("transactions") or startswith("admin/") or startswith("auth/")) | .uri' | sort -u | wc -l
# Expected: 18

# Health endpoint is registered.
php artisan route:list --json | jq '.[] | select(.uri == "healthz") | .method'
# Expected: "GET|HEAD"

# No /api prefix is mounted.
php artisan route:list --json | jq '.[] | select(.uri | startswith("api/")) | .uri'
# Expected: empty (no rows)
```

The `/speckit-implement` command runs these checks as part of its
exit-criteria gate.

## Changelog

### v1.0.0 (2026-04-29) — Plan-time skeleton

- Recorded all 18 Phase 1 endpoint registrations with stable
  `Controller@Action` assignments grouped per plan §"Project
  Structure" (`TransactionController` for `EP-001..EP-008` + `EP-010`,
  `AdminTransactionController` for `EP-009` + `EP-011..EP-014`,
  `AuthController` for `EP-015..EP-018`, `HealthController` for
  `/healthz`).
- Locked `EP-003` and `EP-015` request body shapes per Clarifications
  Q2 (server-issued IDs).
- Recorded auth middleware alias `auth.bearer.presence` for
  `Auth: required` rows per Clarifications Q4.
- Stub responses uniform (`501 not_implemented` + canonical envelope)
  per research.md R-010.

### v1.0.1 (2026-04-29) - Implementation verified

- Verified all 18 Phase 1 endpoint registrations in `backend/routes/api.php`.
- Verified `GET /healthz` maps to `HealthController@show`.
- Verified authenticated rows use `auth.bearer.presence`; `EP-015` and `EP-017` remain public.
- Verified `php artisan route:list --json` has zero `api/`-prefixed product routes.
