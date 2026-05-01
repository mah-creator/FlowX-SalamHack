# Data Model — Core API Implementation (Phase 4)

This document captures the data model Phase 4 implements **in
memory** (per spec FR-024 and research R-001). It is a faithful
encoding of Phase 1's wire entities at
`specs/002-api-discovery/api-contract.md` plus three plan-private
support classes that have no wire shape but exist to keep the
implementation reviewable. A real persistence schema (Eloquent
models, migrations) is Phase 5's surface and is explicitly out of
scope here.

The wire entities (`Transaction`, `AuditLogEntry`, `TxStatus`,
`DemoConfig`, `User`, `NotificationItem`, `ErrorEnvelope`) MUST
match Phase 1's documented shape exactly. Any drift between this
document and Phase 1's `api-contract.md` is resolved in favor of
`api-contract.md` (per spec Assumptions).

---

## Wire entities (unchanged from Phase 1)

### Transaction

Mirrors `specs/002-api-discovery/api-contract.md` § Transaction.

| Field | Type | Required | Allowed values | Phase 4 source |
|-------|------|---------|----------------|----------------|
| `id` | `string` | yes | `TR-####` (server-issued) | `TransactionFactory::nextId()` |
| `source` | `string` enum | yes | `Gaza`, `Egypt` | `config('salamhack.transaction_defaults.source')` |
| `destination` | `string` enum | yes | `Gaza`, `Egypt` | `config('salamhack.transaction_defaults.destination')` |
| `amount` | `number` | yes | numeric, `> 0` | request body |
| `currency` | `string` enum | yes | `USD`, `EGP`, `ILS` | request body |
| `status` | `TxStatus` | yes | see below | state machine |
| `feePercent` | `number` | yes | numeric percent | snapshot from `salamhack.demo_config.fee_percent` at creation |
| `exchangeRate` | `number` | yes | numeric rate | snapshot from `salamhack.demo_config.exchange_rate` at creation |
| `receivableAmount` | `number` | yes | numeric | computed at creation per research R-010 |
| `createdAt` | `string` (date-time) | yes | ISO 8601 with `Z` | `now()->toIso8601ZuluString()` |
| `depositA` | `boolean` | yes | `true` / `false` | state machine |
| `depositB` | `boolean` | yes | `true` / `false` | state machine |
| `disputeReason` | `string` | no | any non-empty string | request body of `EP-008` / `EP-014` |
| `auditLog` | `AuditLogEntry[]` | yes | array | state machine appends |

**Validation rules** (enforced server-side; spec FR-007, FR-013):

- `amount > 0` (FormRequest rule `gt:0`).
- `currency ∈ {USD, EGP, ILS}` (FormRequest rule `in`).
- `id`, `feePercent`, `exchangeRate`, `receivableAmount`,
  `createdAt`, `depositA`, `depositB`, `auditLog`, `source`,
  `destination`: server-only; client-supplied values in the request
  body are silently dropped by the FormRequest's `validated()`
  projection.
- `disputeReason`: required only on `EP-008`; persisted to the
  transaction.

**Phase 4 invariants**:

- The `id` is always issued by the server in `TR-####` format with
  `####` zero-padded to 4 digits and unique within the in-memory
  store.
- `depositA` and `depositB` are only `true` after the corresponding
  `EP-006` call with the matching `party` value succeeds.
- The `auditLog` is append-only; no transition rewrites prior
  entries.

### TxStatus (enum)

Mirrors `specs/002-api-discovery/api-contract.md` § TxStatus.

```text
Pending Request
Match Found
Awaiting Deposits
Deposit Confirmed Partially
Both Deposits Confirmed
Processing Payouts
Completed
Under Review
Failed
Refunded
Disputed
```

Encoded as `App\Domain\Transactions\TransactionStatus`, a string-backed
PHP 8.1 enum with `value` set to the exact wire string above. The
Resource emits `value` directly so the wire shape is unchanged.

### AuditLogEntry

Mirrors `specs/002-api-discovery/api-contract.md` § AuditLogEntry.

| Field | Type | Required | Phase 4 source |
|-------|------|---------|----------------|
| `time` | `string` (date-time) | yes | `now()->toIso8601ZuluString()` |
| `actor` | `string` | yes | `ActorIdentity::id` for user-initiated transitions; `'system'` for the lazy `Processing Payouts → Completed` settlement |
| `action` | `string` | yes | one of the closed action set (research R-011) |

**Closed action set** (research R-011):

```text
request_created
auto_matched
match_confirmed
deposit_a_confirmed
deposit_b_confirmed
payouts_processing_started
payouts_completed
cancelled
dispute_opened
flagged_for_review
admin_approved
admin_refunded
dispute_resolved_completed
dispute_resolved_refunded
```

**Phase 4 invariant**: Every successful state-changing call appends
exactly one new entry. Failed transitions do not append entries
(spec FR-018, SC-007).

### Currency (enum)

Phase 4-internal encoding of the wire `currency` field as
`App\Domain\Transactions\Currency` (string-backed PHP enum:
`USD`, `EGP`, `ILS`).

### DepositParty (enum)

Phase 4-internal encoding of the `EP-006` `party` request field as
`App\Domain\Transactions\DepositParty` (string-backed PHP enum:
`A`, `B`).

### DemoConfig (read-only)

Mirrors `specs/002-api-discovery/api-contract.md` § DemoConfig.

| Field | Type | Phase 4 source |
|-------|------|----------------|
| `feePercent` | `number` | `config('salamhack.demo_config.fee_percent')` |
| `exchangeRate` | `number` | `config('salamhack.demo_config.exchange_rate')` |
| `rateLockMinutes` | `number` | `config('salamhack.demo_config.rate_lock_minutes')` |
| `paymentWindowMinutes` | `number` | `config('salamhack.demo_config.payment_window_minutes')` |

Phase 1's `DemoConfig` entry carries a `drift_notes` line marking it
as a "candidate for backend `GET /config` (derived)". Phase 4 does
NOT introduce a `GET /config` endpoint — the route registry diff
must remain empty (spec SC-004). The values are read from
configuration internally; the `setConfig` operation remains
`client_only` per Phase 1's frontend operations coverage table.

### User

Mirrors `specs/002-api-discovery/api-contract.md` § User. Phase 4
does NOT instantiate `User` records on the wire (the auth endpoints
remain Phase 2 stubs); the entity is included here only because the
Phase 1 audit lists it. Phase 6 owns `User`-shape responses.

### NotificationItem

Mirrors `specs/002-api-discovery/api-contract.md` § NotificationItem.
The Phase 1 frontend operations table marks `ADD_NOTIFICATION` and
`DISMISS_NOTIFICATION` as `client_only`. Phase 4 does NOT touch
notifications.

### ErrorEnvelope

Mirrors `specs/002-api-discovery/api-contract.md` § ErrorEnvelope and
the Phase 2 implementation in
`backend/app/Support/ErrorEnvelope.php`. Phase 4 extends `ErrorEnvelope`
with two new factory methods:

| Factory method | HTTP | `error.code` | When emitted |
|---|---:|---|---|
| `ErrorEnvelope::invalidState(string $endpointId, string $currentStatus)` | `409` | `invalid_state` | A state-changing endpoint is called against a transaction whose current status is not a legal predecessor for that action (spec FR-008..FR-017). |
| `ErrorEnvelope::forbidden(string $reason)` | `403` | `forbidden` | A non-admin caller invokes an admin endpoint, OR a non-admin caller acts on a transaction owned by another user (spec FR-020, FR-022). |

The existing `notFound()`, `unauthenticated()`, `validationFailed()`,
`methodNotAllowed()`, `internalError()`, and `notImplemented()`
factories are re-used unchanged.

---

## Phase 4 plan-private support classes

These classes carry no wire shape and are not addressable from
outside the backend; they are documented here because they appear in
the Phase 4 source tree and the data-model document is the right
place to fix their attributes.

### Transaction (PHP value object)

Implementation of the wire `Transaction` entity at
`App\Domain\Transactions\Transaction`. Every field is a public
typed property (PHP 8.1 readonly class) and the value object is
treated as immutable; transitions return a new instance via
`with*()` helpers.

```text
final readonly class Transaction {
    public function __construct(
        public string $id,
        public string $source,
        public string $destination,
        public float $amount,
        public Currency $currency,
        public TransactionStatus $status,
        public float $feePercent,
        public float $exchangeRate,
        public float $receivableAmount,
        public CarbonImmutable $createdAt,
        public bool $depositA,
        public bool $depositB,
        public ?string $disputeReason,
        public string $ownerId,
        public ?CarbonImmutable $processingPayoutsStartedAt,
        /** @var list<AuditLogEntry> */
        public array $auditLog,
    ) {}

    public function with(/* named args */): self;
}
```

`ownerId` and `processingPayoutsStartedAt` are NOT wire-visible
(neither is in Phase 1's `Transaction` entity); the `TransactionResource`
omits them from JSON output. `ownerId` is the `ActorIdentity::id` of
the caller that created the transaction (spec Assumptions: every
transaction is owned by its creator).

### AuditLogEntry (PHP value object)

`App\Domain\Audit\AuditLogEntry` mirroring the wire shape in
research R-011.

```text
final readonly class AuditLogEntry {
    public function __construct(
        public CarbonImmutable $time,
        public string $actor,
        public string $action,
    ) {}
}
```

### ActorIdentity

`App\Domain\Users\ActorIdentity` (research R-006).

```text
final readonly class ActorIdentity {
    public function __construct(
        public string $id,            // 'usr-' . substr(sha256(token), 0, 12)
        public bool $isAdmin,         // from config allowlist (R-005)
    ) {}

    public static function fromBearerToken(string $token, array $adminTokens): self;
}
```

### SettlementClock

`App\Domain\Transactions\SettlementClock` (research R-004).

```text
final class SettlementClock {
    public function __construct(
        private readonly int $paymentWindowMinutes,
    ) {}

    public function shouldSettle(Transaction $tx, CarbonImmutable $now): bool;
    public function settle(Transaction $tx, CarbonImmutable $now): Transaction;
}
```

`shouldSettle()` returns `true` iff the transaction is in
`Processing Payouts` and `now - processingPayoutsStartedAt >=
paymentWindowMinutes`. `settle()` returns the transaction
transitioned to `Completed` with a `payouts_completed` audit-log
entry whose actor is `'system'`.

### TransactionStore

`App\Domain\Transactions\TransactionStore` (research R-001). Bound
as a Laravel container singleton via
`App\Providers\DomainServiceProvider`.

```text
final class TransactionStore {
    /** @var array<string, Transaction> */
    private array $byId = [];

    public function put(Transaction $tx): void;
    public function get(string $id): ?Transaction;
    public function replace(string $id, Transaction $tx): void;

    /** @return iterable<Transaction> */
    public function all(): iterable;

    /** @return iterable<Transaction> */
    public function ownedBy(string $ownerId): iterable;
}
```

The store is intentionally minimal; ownership filtering and status
filtering are done in the consuming services (the controllers'
collaborators) so the store does not grow query knowledge.

### TransactionFactory

`App\Domain\Transactions\TransactionFactory`.

```text
final class TransactionFactory {
    public function __construct(
        private readonly TransactionStore $store,
        private readonly array $demoConfig,
        private readonly array $transactionDefaults,
        private readonly string $idPrefix,
    ) {}

    public function create(
        string $ownerId,
        float $amount,
        Currency $currency,
        CarbonImmutable $now,
    ): Transaction;

    public function nextId(): string; // TR-#### with monotonic counter
}
```

`nextId()` walks the existing `byId` keys and returns a string in
the form `${idPrefix}${zeroPaddedSequential}` (default
`TR-0001`, `TR-0002`, …). The store is the source of truth for the
counter; restarts reset it (spec FR-025).

### TransactionStateMachine

`App\Domain\Transactions\TransactionStateMachine` (research R-002).
The contract for every transition lives at
[contracts/state-machine.md](./contracts/state-machine.md). One
method per state-changing endpoint:

```text
final class TransactionStateMachine {
    public function autoMatch(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction;
    public function confirmMatch(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction;
    public function confirmDeposit(Transaction $tx, DepositParty $party, ActorIdentity $actor, CarbonImmutable $now): Transaction;
    public function processPayouts(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction;
    public function cancel(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction;
    public function openDispute(Transaction $tx, string $reason, ActorIdentity $actor, CarbonImmutable $now): Transaction;
    public function flagRisk(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction;
    public function approve(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction;
    public function refund(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction;
    public function resolveDispute(Transaction $tx, string $outcome, ActorIdentity $actor, CarbonImmutable $now): Transaction;
}
```

Every method validates the source state against the legal
predecessor set in `contracts/state-machine.md` and throws
`InvalidStateException` on illegal transitions.

---

## Relationships

```text
ActorIdentity (request-scoped, derived from Authorization header)
    │
    │ 1
    │
    ▼
Transaction (in-memory, owned by ActorIdentity.id)
    │
    │ 1   *
    ▼─────► AuditLogEntry (append-only)
    │
    │ 1   1
    └─────► TransactionStatus (enum, mutated only by TransactionStateMachine)
```

- `Transaction.ownerId` is the `ActorIdentity::id` of the caller that
  invoked `EP-003`. Subsequent ownership checks compare this string
  against the request-scoped `ActorIdentity::id`.
- `AuditLogEntry` is owned by `Transaction` and is immutable.
- `TransactionStatus` is owned by `Transaction` and is mutated only
  through `TransactionStateMachine` methods (which return new
  `Transaction` instances; the store then `replace()`s the old
  instance).

---

## State transitions (authoritative table)

The full state-transition table — including legal predecessors,
audit-log action verbs, and frontend grounding — lives at
[contracts/state-machine.md](./contracts/state-machine.md). The
state-machine class MUST read from it and the unit tests in
`tests/Unit/Domain/Transactions/TransactionStateMachineTest.php`
MUST cover every legal and illegal transition for every action.

---

## Persistence boundary

Phase 4's data model is **process-local memory only**. There are no
migrations, no Eloquent models, no SQL, and no on-disk persistence.

Phase 5 will introduce:

- `transactions` table mirroring the wire `Transaction` entity plus
  `owner_id` and `processing_payouts_started_at` columns.
- `audit_log_entries` table with a foreign key to `transactions.id`.
- An `Eloquent`-backed implementation of the same `TransactionStore`
  method surface so the controllers do not change.

The Phase 5 cycle MUST NOT change the wire shape (spec FR-004,
SC-004; constitution Technology Stack & Constraints § Storage).
