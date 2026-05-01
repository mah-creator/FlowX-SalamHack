# FlowX Resource API Contract

This contract is derived from `updated_frontend/src/services`, `updated_frontend/src/features/auth/services/authApi.ts`, `updated_frontend/src/flowx/WorkspacePages.tsx`, and `updated_frontend/db.json`.

## Common Rules

- Base URL is configured by `VITE_API_BASE_URL`; the updated frontend defaults to `http://localhost:5000`.
- Requests send `Accept: application/json`.
- Requests with bodies send `Content-Type: application/json`.
- No authorization header is sent or required in Phase 4.5.
- Collection reads return arrays.
- Empty collection matches return `[]`.
- Item reads return a single object.
- Creates return the created object with HTTP 201 or 200.
- PATCH returns the updated object.
- Missing item ids return HTTP 404.
- Validation failures return HTTP 422.
- Invalid dedicated lifecycle actions return HTTP 409 and do not mutate the resource.

## Users

| Source | Method | Path | Request | Response |
|--------|--------|------|---------|----------|
| `auth.service.ts`, `authApi.ts` | GET | `/users?email={email}&password={password}` | query strings | `ApiUser[]` exact match |
| `authApi.ts` | GET | `/users?email={email}` | query string | `ApiUser[]` exact match |
| `users.service.ts`, `admin.service.ts` | GET | `/users` | none | `ApiUser[]` |
| `users.service.ts` | GET | `/users/{id}` | none | `ApiUser` |
| `auth.service.ts` | POST | `/users` | `ApiUser` or partial signup payload | `ApiUser` |
| `users.service.ts`, `admin.service.ts` | PATCH | `/users/{id}` | `Partial<ApiUser>` | `ApiUser` |

## Wallets

| Source | Method | Path | Request | Response |
|--------|--------|------|---------|----------|
| `wallet.service.ts` | GET | `/wallets` | none | `ApiWallet[]` |
| `wallet.service.ts` | GET | `/wallets?userId={userId}` | query string | `ApiWallet[]` exact match |
| `auth.service.ts` | POST | `/wallets` | `Partial<ApiWallet>` | `ApiWallet` |
| `wallet.service.ts` | PATCH | `/wallets/{id}` | `Partial<ApiWallet>` | `ApiWallet` |

## Transfers

| Source | Method | Path | Request | Response |
|--------|--------|------|---------|----------|
| `transfers.service.ts`, `admin.service.ts` | GET | `/transfers` | none | `ApiTransfer[]` |
| `transfers.service.ts` | GET | `/transfers?userId={userId}` | query string | `ApiTransfer[]` exact match |
| `admin.service.ts` | GET | `/transfers?status=UNDER_REVIEW` | query string | `ApiTransfer[]` exact match |
| `transfers.service.ts` | GET | `/transfers/{id}` | none | `ApiTransfer` |
| `transfers.service.ts` | POST | `/transfers` | `Partial<ApiTransfer>` | `ApiTransfer` |
| `transfers.service.ts` | PATCH | `/transfers/{id}` | `Partial<ApiTransfer>` | `ApiTransfer` |
| `transfers.service.ts` | POST | `/transfers/{id}/match-request` | empty JSON body or no body | `ApiTransfer` |
| `transfers.service.ts` | POST | `/transfers/{id}/submit` | empty JSON body or no body | `ApiTransfer` |
| `admin.service.ts` | POST | `/transfers/{id}/risk-approval` | empty JSON body or no body | `ApiTransfer` |
| `admin.service.ts` | POST | `/transfers/{id}/risk-rejection` | `{ "reason": string }` | `ApiTransfer` |
| `admin.service.ts` | POST | `/transfers/{id}/refund` | `{ "reason": string }` | `ApiTransfer` |

## Verifications

| Source | Method | Path | Request | Response |
|--------|--------|------|---------|----------|
| `verification.service.ts`, `admin.service.ts` | GET | `/verifications` | none | `ApiVerification[]` |
| `verification.service.ts` | GET | `/verifications?userId={userId}` | query string | `ApiVerification[]` exact match |
| `verification.service.ts`, `auth.service.ts` | POST | `/verifications` | `Partial<ApiVerification>` | `ApiVerification` |
| `verification.service.ts`, `admin.service.ts` | PATCH | `/verifications/{id}` | `Partial<ApiVerification>` | `ApiVerification` |

## Disputes

| Source | Method | Path | Request | Response |
|--------|--------|------|---------|----------|
| `disputes.service.ts`, `admin.service.ts` | GET | `/disputes` | none | `ApiDispute[]` |
| `disputes.service.ts` | GET | `/disputes?userId={userId}` | query string | `ApiDispute[]` exact match |
| `disputes.service.ts`, `transfers.service.ts` | POST | `/disputes` | `Partial<ApiDispute>` | `ApiDispute` |
| `disputes.service.ts`, `admin.service.ts` | PATCH | `/disputes/{id}` | `Partial<ApiDispute>` | `ApiDispute` |

## Notifications

| Source | Method | Path | Request | Response |
|--------|--------|------|---------|----------|
| `notifications.service.ts` | GET | `/notifications` | none | `ApiNotification[]` |
| `notifications.service.ts` | GET | `/notifications?userId={userId}` | query string | `ApiNotification[]` exact match |
| `notifications.service.ts`, `auth.service.ts` | POST | `/notifications` | `Partial<ApiNotification>` | `ApiNotification` |
| `notifications.service.ts` | PATCH | `/notifications/{id}` | `Partial<ApiNotification>` | `ApiNotification` |

## Admin Supporting Resources

| Source | Method | Path | Request | Response |
|--------|--------|------|---------|----------|
| `admin.service.ts` | GET | `/config` | none | `ApiConfig` |
| `admin.service.ts` | PATCH | `/config` | `Partial<ApiConfig>` | `ApiConfig` |
| `admin.service.ts` | GET | `/auditLogs` | none | `ApiAuditLog[]` |
| `admin.service.ts` | POST | `/auditLogs` | `ApiAuditLog` | `ApiAuditLog` |

## Read-Mostly Resources

| Source | Method | Path | Response |
|--------|--------|------|----------|
| `WorkspacePages.tsx` | GET | `/agents` | `ApiAgent[]` with `id`, `userId`, `name`, `region`, `status`, `capacity`, `verified` |
| `db.json` / workspace resources | GET | `/paymentMethods` | `{ id, label }[]` |
| `db.json` / workspace resources | GET | `/analytics` | `{ id, label, value, change }[]` |
| `db.json` / workspace resources | GET | `/activities` | `{ id, title, description, createdAt, type }[]` |
| `db.json` / workspace resources | GET | `/requests` | array, empty is valid |

## Compatibility Routes

Existing Phase 4 routes remain valid and must not regress:

- `/transactions`
- `/transactions/{id}`
- `/transactions/{id}/cancel`
- `/transactions/{id}/confirm-match`
- `/transactions/{id}/deposits`
- `/transactions/{id}/process-payouts`
- `/transactions/{id}/disputes`
- `/transactions/{id}/auto-match`
- `/admin/transactions`
- `/admin/transactions/{id}/flag-risk`
- `/admin/transactions/{id}/approve`
- `/admin/transactions/{id}/refund`
- `/admin/transactions/{id}/resolve-dispute`
- `/auth/signup`
- `/auth/login`
- `/auth/verify`
- `/auth/logout`
