# Data Model: FlowX Resource Contract

## FlowXUser

**Source**: `updated_frontend/src/services/types.ts` `ApiUser`; `updated_frontend/db.json.users`

**Fields**:

- `id`: string, unique.
- `fullName`: string.
- `email`: string, lower-case credential lookup key.
- `password`: string, optional in type but present for demo login/signup lookup.
- `role`: `USER` or `ADMIN`.
- `accountType`: `Individual`, `Business`, or `Admin`.
- `country`: string.
- `phone`: string.
- `verified`: boolean.
- `kycLevel`: `Basic`, `Verified`, `Trusted`, or `Agent`.
- `verificationStatus`: `PENDING`, `IN_REVIEW`, `VERIFIED`, `REJECTED`, or `NEEDS_INFO`.
- `trustScore`: number.
- `status`: `active`, `pending`, or `suspended`.
- `createdAt`: ISO-8601 string.

**Validation**:

- `POST /users` accepts frontend-supplied ids but may fill safe defaults when omitted.
- `GET /users?email=...&password=...` returns exact matches as an array.
- Suspended users may be returned by lookup, but the frontend rejects them as current users.
- `PATCH /users/{id}` preserves unspecified fields.

## FlowXTransfer

**Source**: `ApiTransfer`; `db.json.transfers`

**Fields**:

- `id`: string, unique.
- `userId`: string, references FlowXUser.
- `sourceCountry`: string.
- `destinationCountry`: string.
- `amount`: number.
- `currency`: `USD`, `EGP`, or `ILS`.
- `fee`: number.
- `exchangeRate`: number.
- `netAmount`: number.
- `status`: FlowX transfer status.
- `paymentMethod`: string.
- `receiverName`: string.
- `receiverPaymentMethod`: string.
- `referenceNumber`: string.
- `createdAt`: ISO-8601 string.
- `updatedAt`: ISO-8601 string.
- `riskLevel`: `low`, `medium`, or `high`.
- `paymentConfirmationRequested`: boolean.

**Status Vocabulary**:

`PENDING_REQUEST`, `MATCH_FOUND`, `AWAITING_DEPOSIT`, `DEPOSIT_PENDING`, `DEPOSIT_CONFIRMED`, `BOTH_DEPOSITS_CONFIRMED`, `PROCESSING_PAYOUT`, `COMPLETED`, `UNDER_REVIEW`, `DISPUTED`, `REFUNDED`, `FAILED`, `CANCELLED`.

**Validation**:

- `POST /transfers` requires enough user-entered fields to create a visible transfer and fills `fee`, `netAmount`, `referenceNumber`, timestamps, `status`, `riskLevel`, and `paymentConfirmationRequested` defaults.
- `GET /transfers?userId=...` and `GET /transfers?status=...` exact-match filter and return arrays.
- `PATCH /transfers/{id}` is mock-compatible and partial.
- Dedicated action routes enforce the transition table below.

### Dedicated Transfer Actions

| Route | Allowed Current Status | Result |
|-------|------------------------|--------|
| `POST /transfers/{id}/match-request` | `PENDING_REQUEST` | `MATCH_FOUND` |
| `POST /transfers/{id}/submit` | `PENDING_REQUEST`, `MATCH_FOUND` | `AWAITING_DEPOSIT` |
| `PATCH /transfers/{id}` with `paymentConfirmationRequested: true` | Any non-terminal status | flag becomes `true`; status unchanged unless supplied |
| `POST /transfers/{id}/risk-approval` | `UNDER_REVIEW` | `BOTH_DEPOSITS_CONFIRMED` |
| `POST /transfers/{id}/risk-rejection` | `UNDER_REVIEW` | `FAILED` |
| `POST /transfers/{id}/refund` | `AWAITING_DEPOSIT`, `DEPOSIT_PENDING`, `DEPOSIT_CONFIRMED`, `BOTH_DEPOSITS_CONFIRMED`, `PROCESSING_PAYOUT`, `UNDER_REVIEW`, `DISPUTED` | `REFUNDED` |
| `PATCH /transfers/{id}` with `status: CANCELLED` | Generic patch path | accepted for mock compatibility |

Terminal statuses: `COMPLETED`, `REFUNDED`, `FAILED`, `CANCELLED`.

## Wallet

**Fields**: `id`, `userId`, `balance`, `currency`, `escrowBalance`, `availableBalance`.

**Validation**:

- `GET /wallets?userId=...` exact-match filters.
- `POST /wallets` supports signup-created starter wallets.
- `PATCH /wallets/{id}` preserves unspecified fields and numeric balances.

## Verification

**Fields**: `id`, `userId`, `status`, `level`, `documentType`, `submittedAt`, `reviewedAt`, `reviewerId`, `rejectionReason`.

**Validation**:

- `POST /verifications` supports signup or user-submitted verification rows.
- `PATCH /verifications/{id}` supports admin approval, rejection, and more-info updates.
- Admin verification updates may be paired with `PATCH /users/{id}` and `POST /auditLogs` from the frontend; backend-owned admin actions should also leave audit data where applicable.

## Dispute

**Fields**: `id`, `transferId`, `userId`, `reason`, `evidence`, `status`, `resolution`, `createdAt`, `resolvedAt`.

**Validation**:

- `POST /disputes` opens an `OPEN` dispute and should set the linked transfer to `DISPUTED` when possible.
- `GET /disputes?userId=...` exact-match filters.
- `PATCH /disputes/{id}` supports `RESOLVED` and `REJECTED`, with resolution text and resolved timestamp.

## Notification

**Fields**: `id`, `userId`, `title`, `message`, `read`, `type`, `createdAt`.

**Validation**:

- `GET /notifications?userId=...` exact-match filters.
- `POST /notifications` supports signup welcome messages and system messages.
- `PATCH /notifications/{id}` supports marking as read.

## Configuration

**Fields**: `id`, `feePercent`, `exchangeRate`, `supportedCountries`, `supportedCurrencies`, `supportedCorridors`, `paymentWindowMinutes`.

**Validation**:

- `GET /config` returns a single object, not an array.
- `PATCH /config` partially updates supported fields and preserves omitted values.

## AuditLog

**Fields**: `id`, `actorId`, `actorRole`, `action`, `entityType`, `entityId`, `createdAt`.

**Validation**:

- `GET /auditLogs` returns an array.
- `POST /auditLogs` accepts frontend-authored audit entries.
- Backend-owned admin action routes must also append compatible entries.

## Static/Read-Mostly Resources

### Agent

Fields: `id`, `userId`, `name`, `region`, `status`, `capacity`, `verified`.

`GET /agents` returns an array sufficient for the marketplace page.

### PaymentMethod

Fields: `id`, `label`.

`GET /paymentMethods` returns an array.

### AnalyticsMetric

Fields: `id`, `label`, `value`, `change`.

`GET /analytics` returns an array.

### Activity

Fields: `id`, `title`, `description`, `createdAt`, `type`.

`GET /activities` returns an array.

### Request

`GET /requests` returns an array. Empty array is valid for the current demo dataset.
