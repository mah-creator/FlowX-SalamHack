# Data Model: Phase 5 Data Persistence

## Common Persistence Rules

- All persisted FlowX resources keep the frontend-visible string `id` values used by Phase 4.5.
- Frontend-visible timestamps remain ISO-8601 strings in responses.
- Collection filters remain exact-match filters for fields used by the updated frontend.
- Partial updates preserve unspecified fields.
- Successful multi-record actions must complete as one user-visible outcome; failed actions must not leave orphaned records.
- Baseline seeders create records only when missing. Explicit reset may clear local demo data and restore the baseline.
- Temporary Phase 4.5 runtime data is not imported.

## FlowXUser

**Purpose**: Durable user or admin account.

**Fields**:

- `id`: string, primary frontend-visible identifier.
- `fullName`: string.
- `email`: string, unique credential lookup key.
- `password`: string for demo compatibility.
- `role`: `USER` or `ADMIN`.
- `accountType`: `Individual`, `Business`, or `Admin`.
- `country`: string.
- `phone`: string.
- `verified`: boolean.
- `kycLevel`: `Basic`, `Verified`, `Trusted`, or `Agent`.
- `verificationStatus`: `PENDING`, `IN_REVIEW`, `VERIFIED`, `REJECTED`, or `NEEDS_INFO`.
- `trustScore`: number.
- `status`: `active`, `pending`, or `suspended`.
- `createdAt`: ISO-8601 timestamp.

**Relationships**:

- Has many wallets, transfers, verifications, disputes, notifications, and audit logs.

**Validation and uniqueness**:

- `email` must be unique for lookup behavior.
- Suspended users may exist but must not become valid current users.
- Signup creates associated starter wallet, starter verification, and welcome notification.

## FlowXTransfer

**Purpose**: Canonical persisted transfer-like workflow record for FlowX and overlapping legacy transaction behavior.

**Fields**:

- `id`: string, primary frontend-visible identifier.
- `userId`: references FlowXUser.
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
- `referenceNumber`: string, unique.
- `createdAt`: ISO-8601 timestamp.
- `updatedAt`: ISO-8601 timestamp.
- `riskLevel`: `low`, `medium`, or `high`.
- `paymentConfirmationRequested`: boolean.

**Relationships**:

- Belongs to FlowXUser.
- Has many disputes.
- Has many audit logs by entity reference.
- Provides compatibility mapping for overlapping Phase 4 transaction behavior.

**Status vocabulary**:

`PENDING_REQUEST`, `MATCH_FOUND`, `AWAITING_DEPOSIT`, `DEPOSIT_PENDING`, `DEPOSIT_CONFIRMED`, `BOTH_DEPOSITS_CONFIRMED`, `PROCESSING_PAYOUT`, `COMPLETED`, `UNDER_REVIEW`, `DISPUTED`, `REFUNDED`, `FAILED`, `CANCELLED`.

**State transitions**:

| Action | Allowed Current Status | Result |
|--------|------------------------|--------|
| Match request | `PENDING_REQUEST` | `MATCH_FOUND` |
| Submit | `PENDING_REQUEST`, `MATCH_FOUND` | `AWAITING_DEPOSIT` |
| Payment confirmation request | Any non-terminal status | `paymentConfirmationRequested = true` |
| Risk approval | `UNDER_REVIEW` | `BOTH_DEPOSITS_CONFIRMED` |
| Risk rejection | `UNDER_REVIEW` | `FAILED` |
| Refund | `AWAITING_DEPOSIT`, `DEPOSIT_PENDING`, `DEPOSIT_CONFIRMED`, `BOTH_DEPOSITS_CONFIRMED`, `PROCESSING_PAYOUT`, `UNDER_REVIEW`, `DISPUTED` | `REFUNDED` |
| Generic cancellation patch | Mock-compatible partial update | `CANCELLED` accepted |

Terminal statuses: `COMPLETED`, `REFUNDED`, `FAILED`, `CANCELLED`.

**Validation and uniqueness**:

- `userId` must reference an existing user.
- `referenceNumber` must be unique.
- Creates fill backend-owned defaults for fees, net amount, reference number, timestamps, status, risk level, and payment confirmation flag.
- Dedicated lifecycle actions reject invalid transitions without mutation.

## Wallet

**Purpose**: Durable balance record tied to a user.

**Fields**:

- `id`: string.
- `userId`: references FlowXUser.
- `balance`: number.
- `currency`: string.
- `escrowBalance`: number.
- `availableBalance`: number.

**Relationships**:

- Belongs to FlowXUser.

**Validation**:

- `userId` must reference an existing user.
- Numeric balances must be preserved across partial updates.
- User-filtered wallet reads return arrays.

## Verification

**Purpose**: Durable identity or business verification record.

**Fields**:

- `id`: string.
- `userId`: references FlowXUser.
- `status`: `PENDING`, `IN_REVIEW`, `VERIFIED`, `REJECTED`, or `NEEDS_INFO`.
- `level`: string.
- `documentType`: string.
- `submittedAt`: ISO-8601 timestamp.
- `reviewedAt`: ISO-8601 timestamp or null.
- `reviewerId`: references admin FlowXUser when reviewed.
- `rejectionReason`: string or null.

**Relationships**:

- Belongs to FlowXUser.
- Reviewer references an admin FlowXUser when present.

**Validation**:

- `userId` must reference an existing user.
- Admin updates may also update the associated user's verification fields and must write audit log data.

## Dispute

**Purpose**: Durable transfer dispute.

**Fields**:

- `id`: string.
- `transferId`: references FlowXTransfer.
- `userId`: references FlowXUser.
- `reason`: string.
- `evidence`: string or structured evidence payload.
- `status`: `OPEN`, `RESOLVED`, or `REJECTED`.
- `resolution`: string or null.
- `createdAt`: ISO-8601 timestamp.
- `resolvedAt`: ISO-8601 timestamp or null.

**Relationships**:

- Belongs to FlowXTransfer.
- Belongs to FlowXUser.

**Validation**:

- `transferId` and `userId` must reference existing records.
- Opening a dispute should move the linked transfer to `DISPUTED` when valid.
- Resolving a dispute records resolution and resolved timestamp.

## Notification

**Purpose**: Durable user-facing message.

**Fields**:

- `id`: string.
- `userId`: references FlowXUser.
- `title`: string.
- `message`: string.
- `read`: boolean.
- `type`: string.
- `createdAt`: ISO-8601 timestamp.

**Relationships**:

- Belongs to FlowXUser.

**Validation**:

- `userId` must reference an existing user.
- Partial updates support marking notifications as read.

## Configuration

**Purpose**: Durable platform settings.

**Fields**:

- `id`: string.
- `feePercent`: number.
- `exchangeRate`: number.
- `supportedCountries`: list.
- `supportedCurrencies`: list.
- `supportedCorridors`: list.
- `paymentWindowMinutes`: number.

**Validation**:

- Exactly one active demo configuration is expected for Phase 5.
- Partial updates preserve omitted values.
- Admin configuration changes write audit log data.

## AuditLog

**Purpose**: Durable record of admin or system actions.

**Fields**:

- `id`: string.
- `actorId`: references FlowXUser when present.
- `actorRole`: string.
- `action`: string.
- `entityType`: string.
- `entityId`: string.
- `createdAt`: ISO-8601 timestamp.

**Relationships**:

- Actor references FlowXUser when available.
- Entity references are polymorphic by `entityType` and `entityId`.

**Validation**:

- Admin state-changing actions must create audit log entries.
- Frontend-authored audit entries remain accepted for compatibility.

## Reference Resources

### Agent

Fields: `id`, `userId`, `name`, `region`, `status`, `capacity`, `verified`.

Agents are seeded baseline marketplace records. `userId` references FlowXUser when an account exists for that agent.

### PaymentMethod

Fields: `id`, `label`.

Payment methods are seeded baseline reference records and should not duplicate on repeated initialization.

### AnalyticsMetric

Fields: `id`, `label`, `value`, `change`.

Analytics metrics are seeded/read-mostly records sufficient for the admin analytics page.

### Activity

Fields: `id`, `title`, `description`, `createdAt`, `type`.

Activities are seeded/read-mostly records sufficient for workspace activity displays.

### Request

Fields are kept compatible with the Phase 4.5 frontend contract. Empty array is valid for the baseline dataset.
