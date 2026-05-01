# Phase 0 Research — Core API Implementation (Phase 4)

This document records the plan-time decisions for Phase 4 that the
spec deliberately deferred to the plan, the rationale for each, and
alternatives considered. The spec at
`specs/005-core-api-implementation/spec.md` carries 0
`[NEEDS CLARIFICATION]` markers; the four implementation choices the
spec deferred via its Assumptions section (auto-match semantics,
process-payouts settlement timing, admin identity source, in-memory
storage shape) are resolved here without re-running
`/speckit-clarify`.

The Phase 2 research document at
`specs/003-backend-foundation/research.md` already records the
foundation-level decisions (Laravel 11, PHP 8.3, Pest 3, FormRequest
pattern, JsonResource pattern, central exception handler, structured
logging, CORS, presence-of-credential auth, stub-response convention,
health endpoint shape). Phase 4 inherits all of those without
re-evaluation; this document only records what is *new* to Phase 4.

---

## R-001 — In-memory storage shape

- **Decision**: A single application-scoped singleton class
  `App\Domain\Transactions\TransactionStore` registered via
  `App\Providers\DomainServiceProvider`. The store holds an
  `array<string, App\Domain\Transactions\Transaction>` keyed by the
  transaction id. Reads return cloned `Transaction` instances so
  callers cannot accidentally mutate stored state. Writes go through
  one of three explicit methods: `put(Transaction)`, `replace(string $id,
  Transaction)`, and `all(): iterable<Transaction>`. Filtering by
  ownership and status is done in the consuming services, not in the
  store.

- **Rationale**: A singleton-bound POPO store is the smallest
  implementation that satisfies spec FR-024 (in-memory storage
  permitted) without leaking PHP's request-scoped lifecycle into the
  domain. Laravel's container guarantees a single instance per
  process for the duration of `php artisan serve`, which is the
  Phase 4 demo target. Spec FR-025 explicitly accepts that restarts
  reset the store. Phase 5 will replace the store with an Eloquent
  `TransactionRepository` interface that exposes the same method
  surface, so the controllers and services do not need to change
  shape when persistence lands.

- **Alternatives considered**:
  - Laravel's `Cache::store('array')` — works for the lifetime of a
    request but resets between requests under PHP-FPM; rejected
    because Phase 4 must survive across requests within the
    `artisan serve` process.
  - File-backed JSON storage (e.g., `storage/app/transactions.json`)
    — survives restarts but introduces a serialization surface and
    file-locking concerns we don't need; persistence is Phase 5's
    surface.
  - SQLite at `storage/database/database.sqlite` — already shipped
    with Laravel and would survive restarts, but requires migrations
    and Eloquent models, which spec FR-024 reserves for Phase 5.

## R-002 — State machine encoding

- **Decision**: A pure-PHP class
  `App\Domain\Transactions\TransactionStateMachine` exposes one
  method per documented action (`autoMatch`, `confirmMatch`,
  `confirmDeposit`, `processPayouts`, `cancel`, `openDispute`,
  `flagRisk`, `approve`, `refund`, `resolveDispute`,
  `settleProcessingPayouts`). Each method takes the current
  `Transaction`, validates the source state against the legal
  predecessor set documented in
  [contracts/state-machine.md](./contracts/state-machine.md),
  appends an `AuditLogEntry`, and returns a new `Transaction` value
  (the input is treated as immutable). On illegal transitions the
  method throws `App\Exceptions\InvalidStateException`, which the
  central exception handler renders as the canonical
  `409 invalid_state` envelope.

- **Rationale**: The state-changing endpoints share most of their
  shape: load the transaction (or 404), enforce ownership (or 403),
  call the matching state-machine method (or 409), persist, and
  return the resource. Encapsulating the transitions in one class
  keeps controllers thin (Principle IV) and lets the state-machine
  unit test in `tests/Unit/Domain/Transactions/TransactionStateMachineTest.php`
  exhaustively cover every legal and illegal transition without
  going through HTTP. The state-machine table at
  `contracts/state-machine.md` is the reviewable contract; the class
  is the implementation that must read from it.

- **Alternatives considered**:
  - One `TransitionAction` class per action (one-class-per-feature) —
    rejected for ceremony at the 11-action scale; we'd repeat the
    same `if (!in_array($current, $allowed)) throw …` boilerplate 11
    times.
  - A workflow/state-machine library (Symfony Workflow,
    `winzou/state-machine`) — rejected; introduces a configuration
    DSL that obscures the contract, and we don't need event
    subscribers, guards, or marking stores.
  - Open-coded state checks inside controllers — rejected; violates
    Principle IV ("Controllers: thin").

## R-003 — Auto-match semantics

- **Decision**: `EP-010 POST /transactions/{id}/auto-match`
  transitions the requested transaction from `Pending Request` to
  `Match Found` and appends an audit-log entry; it does NOT search
  for a real counterparty transaction in the store. There is no
  "match" record beyond the transaction's own status. The endpoint
  returns the requested transaction's updated state.

- **Rationale**: The frontend's demo behavior at
  `frontend/src/context/DemoContext.tsx:185-190` (`autoMatch`) is a
  status-only transition. Phase 1's `EP-010` entry documents
  `status_side_effects: Pending Request to Match Found` and nothing
  about a counterparty record. The spec's Assumptions section
  explicitly defers a real two-sided matching algorithm. Implementing
  pair-matching in Phase 4 would (a) fabricate behavior not in the
  Phase 1 contract, and (b) require either an additional
  counterparty-creation endpoint or implicit creation of opposite-side
  transactions, both of which would be Phase 1 amendments.

- **Alternatives considered**:
  - FIFO pair-matching against existing `Pending Request` transactions
    in the store — rejected because no Phase 1 endpoint documents what
    happens to the "other side"; we'd be inventing contract.
  - Synthetic counterparty creation at match time — rejected for the
    same reason; the frontend never observes a paired transaction
    today.
  - Reject auto-match if no counterparty exists — rejected because
    the frontend's `NewTransferPage` calls `autoMatch` immediately
    after `createTransaction`, so the demo flow would always fail.

## R-004 — Process-payouts settlement timing (lazy on-read)

- **Decision**: `EP-007 POST /transactions/{id}/process-payouts`
  immediately transitions the transaction from
  `Both Deposits Confirmed` to `Processing Payouts` and stamps a
  `processing_payouts_started_at` server timestamp on the
  transaction (a non-wire-visible field). The synchronous response
  carries `status: "Processing Payouts"`. On every subsequent read
  through `EP-001` and `EP-002`, the `TransactionStore` runs each
  `Processing Payouts` transaction through `SettlementClock`: if
  `now() - processing_payouts_started_at >= paymentWindowMinutes`,
  the transaction is transitioned to `Completed` (with an audit-log
  entry recording the settlement) before being returned. A separate
  unit-testable `SettlementClock` wraps `Carbon::now()` so tests can
  freeze time.

- **Rationale**: Spec FR-011 requires the server to transition the
  transaction to `Completed` "within the documented settlement
  window without further frontend action." The frontend already
  polls `EP-002` (Phase 1's grounding note for `EP-007` cites
  `frontend/src/context/DemoContext.tsx:210-219`'s `setTimeout`), so
  lazy on-read settlement matches the frontend's actual observation
  pattern at zero scheduling cost. No queue worker, no cron, no
  scheduled tasks: a deployment of Phase 4 only requires a running
  HTTP server.

- **Alternatives considered**:
  - `Bus::dispatch(SettleTransaction::class)->delay(...)` plus a
    queue worker — works but introduces a queue driver dependency and
    a second process to run during the demo; rejected for
    deployment friction.
  - `php artisan schedule:run` cron task that runs once a minute and
    settles eligible transactions — works but requires a cron entry
    or a long-running `schedule:work` process; rejected for the same
    reason.
  - Synchronously transition `Processing Payouts → Completed` inside
    the same `EP-007` request handler — rejected because the
    response shape would lose the `Processing Payouts` state, and
    the frontend's polling-based UX would never observe the
    intermediate state. That would silently amend the Phase 1
    contract.

  **Default settlement window**: `paymentWindowMinutes = 1`
  (one minute) for local development, configurable via
  `SALAMHACK_PAYMENT_WINDOW_MINUTES` env var. The Phase 1 `DemoConfig`
  default is 30 minutes; the Phase 4 dev override exists so the demo
  user journey completes within spec SC-005's 90-second budget. The
  config default in `config/salamhack.php` mirrors the env var and
  defaults to `1`; production deployments (Phase 7) can pin to 30.

## R-005 — Admin identity source

- **Decision**: A configuration-driven allowlist of admin bearer
  tokens, declared in `config/salamhack.php` and read from the
  `SALAMHACK_ADMIN_TOKENS` env var (comma-separated). A new
  middleware `App\Http\Middleware\AdminGuard` runs *after*
  `BearerPresenceAuth`. It reads the bearer token, hashes it (SHA-256
  truncated to the first 16 bytes for log privacy), and checks the
  raw token against the allowlist. If the token is not in the
  allowlist, the middleware throws
  `App\Exceptions\ForbiddenAccessException`, which renders as the
  canonical `403 forbidden` envelope. If the allowlist is empty (the
  zero-config case for local development), every authenticated
  caller is treated as an admin so the demo can exercise the admin
  flows without configuration.

- **Rationale**: Phase 6 will replace the bearer-token allowlist
  with Sanctum-issued tokens carrying an `is_admin` claim or scope.
  Phase 4 must produce the **observable contract** (`403` for
  non-admins on admin endpoints) without fabricating credentials.
  An env-driven allowlist is the smallest mechanism that satisfies
  spec FR-022 today and that Phase 6 can swap for credential-backed
  admin authority without touching controllers or routes.

- **Alternatives considered**:
  - A boolean `is_admin` flag on a future `User` Eloquent model —
    rejected because Phase 4 has no Eloquent model and no `users`
    table; Phase 5 would need to backfill admin records.
  - A magic header (`X-Admin: true`) — rejected as security theater
    and as a Phase 1 contract amendment (the frontend never sends
    such a header).
  - A separate admin auth guard (`auth:admin`) — rejected because
    Phase 4 is intentionally not introducing Laravel auth guards;
    Phase 6 owns the auth guard topology.

## R-006 — Caller identity for ownership

- **Decision**: A new value object
  `App\Domain\Users\ActorIdentity` is constructed once per request
  from the `Authorization` header by a small helper resolved from the
  container. The actor's `id` is `'usr-' . substr(hash('sha256',
  $bearerToken), 0, 12)`. The actor's `isAdmin` flag is `true` if and
  only if the raw bearer token appears in the
  `salamhack.admin_tokens` config (or the config is empty in local
  dev — see R-005). `ActorIdentity` is bound as a request-scoped
  singleton and injected into controller constructors.

- **Rationale**: Phase 4 needs a stable user identifier for
  ownership scoping (spec FR-019, FR-020) without issuing tokens or
  storing user records. Hashing the bearer token gives a
  deterministic, non-reversible id that is stable across requests
  for the same caller. The `usr-` prefix matches the Phase 2
  `id_origin` policy (`User.id` is server-issued opaque string)
  recorded in
  `specs/003-backend-foundation/contracts/route-registry.md` § ID-origin
  policy.

- **Alternatives considered**:
  - Use the raw bearer token as the user id — rejected; the audit
    log would leak the token.
  - Use a fixed `usr-demo` for every authenticated caller —
    rejected; ownership scoping would be untestable, and any test
    with two callers would fail.
  - Issue session ids and store them in the in-memory store —
    rejected; introduces session lifecycle that Phase 6 will
    replace anyway.

## R-007 — Validation rules per endpoint (FormRequest classes)

- **Decision**: One `FormRequest` per state-changing endpoint with a
  non-empty body, plus a shared `EmptyBodyRequest` for endpoints
  whose body is the empty object `{}`. Per-class rules:

  | FormRequest | Endpoint | Rules (Laravel rule strings) |
  |---|---|---|
  | `StoreTransactionRequest` | `EP-003` | `amount: required, numeric, gt:0`; `currency: required, string, in:USD,EGP,ILS`; client-supplied `id` is silently ignored (the `validated()` projection drops it). |
  | `ConfirmDepositRequest` | `EP-006` | `party: required, string, in:A,B`. |
  | `OpenDisputeRequest` | `EP-008` | `reason: required, string, min:1`. |
  | `ResolveDisputeRequest` | `EP-014` | `outcome: required, string, in:Completed,Refunded`. |
  | `IndexAdminTransactionsRequest` | `EP-009` | `status: sometimes, string, in:<TxStatus enum values>`. |
  | `EmptyBodyRequest` | `EP-004`, `EP-005`, `EP-007`, `EP-010`, `EP-011`, `EP-012`, `EP-013` | request body MUST be `{}` or absent; reject any non-empty top-level keys to keep the wire contract honest. |

- **Rationale**: Constitution Principle IV requires `FormRequest`
  validation. Each endpoint's body shape comes directly from Phase 1
  `api-contract.md`. Failed validation flows through Laravel's
  `ValidationException`, which Phase 2's `EnvelopeRenderer` already
  maps to `422 validation_failed` with field-level details — no new
  exception-handler work is required.

- **Alternatives considered**:
  - Inline `Validator::make()` in each controller method — rejected
    by Principle IV.
  - One mega-`FormRequest` per controller — rejected because rule
    arrays diverge per endpoint; a shared class would re-introduce
    branching.
  - Spatie's data-transfer-object package — rejected as out-of-stack
    addition with no Phase 4 benefit.

## R-008 — Resource shape and currency formatting

- **Decision**: One `App\Http\Resources\TransactionResource` projects
  every wire field documented in Phase 1's `Transaction` entity:

  ```php
  return [
      'id' => $this->id,
      'source' => $this->source,
      'destination' => $this->destination,
      'amount' => $this->amount,
      'currency' => $this->currency->value,
      'status' => $this->status->value,
      'feePercent' => $this->feePercent,
      'exchangeRate' => $this->exchangeRate,
      'receivableAmount' => $this->receivableAmount,
      'createdAt' => $this->createdAt->toIso8601ZuluString(),
      'depositA' => $this->depositA,
      'depositB' => $this->depositB,
      'disputeReason' => $this->disputeReason,
      'auditLog' => AuditLogEntryResource::collection($this->auditLog),
  ];
  ```

  Numeric fields stay numeric (no string formatting). `createdAt`
  and `auditLog[].time` use ISO 8601 with the `Z` suffix to match
  the Phase 1 example values (`2026-04-29T00:00:00.000Z`). One
  `App\Http\Resources\TransactionCollection` wraps a list under the
  documented `{ "transactions": [...] }` envelope used by both
  `EP-001` and `EP-009`.

- **Rationale**: The Phase 1 entity table is the authoritative wire
  shape. Centralizing projection in one Resource means a contract
  change is a one-file edit, and the diff is visible in PR review
  (Principle IV). The Phase 1 `createdAt` example uses
  `.000Z`-formatted UTC; matching it here avoids subtle drift
  (Carbon's default `toIso8601String()` uses `+00:00`).

- **Alternatives considered**:
  - Hand-rolled `response()->json([...])` per endpoint — rejected by
    Principle IV.
  - Use Laravel's `JsonResource` `additional()` to attach an envelope
    — rejected because the documented envelope is the *list* itself,
    not a metadata wrapper, and `additional()` would emit the wrong
    shape.

## R-009 — Source/destination derivation for new transactions

- **Decision**: At creation time, set `source = 'Gaza'` and
  `destination = 'Egypt'` for every new transaction (the Phase 1
  example values). The `source`/`destination` fields are part of the
  wire shape but the Phase 1 `EP-003` request body does NOT include
  them, so the server must pick a default. The values are taken
  from a new `salamhack.transaction_defaults.source` and
  `salamhack.transaction_defaults.destination` config entry, both
  defaulting to the Phase 1 example values.

- **Rationale**: Phase 1's `Transaction` entity documents `source`
  and `destination` as required string-enum fields with allowed
  values `Gaza`, `Egypt`. The `EP-003` request body documented in
  Phase 1 contains only `amount` and `currency`. The frontend's
  `NewTransferPage` and `DemoContext` initialise these fields
  client-side from a fixed pair (`frontend/src/lib/demoStore.ts`
  defaults). Without these defaults, the response shape would be
  invalid against the Phase 1 entity. This is a derivation, not an
  amendment: the values match what the frontend's demo store would
  have produced.

- **Alternatives considered**:
  - Require `source`/`destination` in the request body — rejected;
    would amend Phase 1's documented `EP-003` request body.
  - Random selection from `[Gaza, Egypt]` per side — rejected;
    non-deterministic responses break contract tests.
  - Read source/destination from the bearer token / user record —
    rejected; we have neither in Phase 4.

## R-010 — `receivableAmount` computation

- **Decision**: `receivableAmount = round(amount * exchangeRate * (1
  - feePercent / 100), 2)` computed at creation time and stored.
  `feePercent` and `exchangeRate` are read from
  `config('salamhack.demo_config')` at the moment of creation and
  frozen onto the transaction (rate-lock semantics) so subsequent
  calls return a consistent value. Currency conversion is not
  implemented in Phase 4: `exchangeRate` is treated as a unitless
  multiplier (the Phase 1 example uses `1.0`).

- **Rationale**: The Phase 1 `Transaction` entity's
  `receivableAmount` example (`735` for `amount=750`, `feePercent=2`,
  `exchangeRate=1.0`) implies the formula `amount × (1 - fee%) ×
  rate`. Rate-lock semantics (freezing fee/rate on the transaction)
  matches the Phase 1 `DemoConfig.rateLockMinutes` field, which the
  frontend's `setConfig` does not call against the backend (it's
  client-only).

- **Alternatives considered**:
  - Recompute `receivableAmount` on every read — rejected; rate-lock
    would not hold and admin config changes would silently rewrite
    historical transactions.
  - Store fee/rate in `DemoConfig` only and not on the transaction —
    rejected; Phase 1's `Transaction` entity has them as required
    fields, so they must round-trip on the wire.

## R-011 — Audit log field semantics

- **Decision**: An `AuditLogEntry` carries:
  - `time`: ISO 8601 UTC string from `now()->toIso8601ZuluString()`.
  - `actor`: `ActorIdentity::id` (e.g., `usr-3a7c1f9e2b1d`) for
    user-initiated transitions; `'system'` for the lazy
    `Processing Payouts → Completed` settlement.
  - `action`: a stable verb string from a closed set:
    `'request_created'`, `'auto_matched'`, `'match_confirmed'`,
    `'deposit_a_confirmed'`, `'deposit_b_confirmed'`,
    `'payouts_processing_started'`, `'payouts_completed'`,
    `'cancelled'`, `'dispute_opened'`, `'flagged_for_review'`,
    `'admin_approved'`, `'admin_refunded'`, `'dispute_resolved_completed'`,
    `'dispute_resolved_refunded'`.

- **Rationale**: Spec FR-018 requires exactly one audit-log entry
  per successful state-changing call with a stable action verb. A
  closed enum-like set keeps the actions reviewable in one place
  (the state-machine table at `contracts/state-machine.md`) and
  prevents callers from inventing strings. The `actor: 'system'`
  reservation makes the lazy settlement traceable without
  pretending an HTTP caller initiated it.

- **Alternatives considered**:
  - Free-form action strings — rejected; would diverge per
    contributor.
  - Numeric action codes — rejected; the wire shape is documented as
    `string` in Phase 1.

## R-012 — Test ordering and TDD enforcement

- **Decision**: Phase 4's PR is structured so the new tests appear
  in commits *before* the implementation commits, satisfying spec
  FR-030 and Principle II. Concretely:
  1. Commit A: add the state-machine unit tests; they fail because
     `TransactionStateMachine` does not exist.
  2. Commit B: add `TransactionStateMachine` and the supporting
     domain types; the unit tests pass; the contract suite still
     reports 14 stub failures.
  3. Commits C..P (one per endpoint): add the feature test for the
     endpoint, then the controller body / FormRequest / Resource /
     middleware piece that makes it pass; the contract suite gains
     one passing endpoint per commit pair.
  4. Commit Q: enable lazy settlement on read, add settlement test;
     the contract suite reports 14 passing + 4 expected stubs.
  5. Commit R: refresh `quickstart.md` if needed; update
     `CLAUDE.md` plan pointer.

- **Rationale**: This commit ordering is the auditable form of
  "tests before implementation" required by Principle II. A
  reviewer can `git log -p` and see each test land before the code
  that satisfies it. The Phase 3 contract suite acts as the
  end-to-end gate.

- **Alternatives considered**:
  - One mega-commit at the end — rejected; loses the test-first
    audit trail.
  - Per-endpoint tests authored after the code — rejected by
    Principle II.

## R-013 — Phase 3 dispensation continues unchanged

- **Decision**: The constitution Principle III dispensation recorded
  in Phase 2's `plan.md` Complexity Tracking row 2 (Phase 3 contract
  tests proceed against derived endpoint specs because the frontend
  issues zero observed HTTP requests at audit commit `6f29646`)
  remains in force for Phase 4. Phase 4 does not author new contract
  tests and does not amend the dispensation. If a frontend wire-up
  lands during Phase 4, the Phase 1 audit MUST be updated and the
  contract test re-grounded in the same change set; Phase 4
  implementation MUST then be brought into line. The implementation
  must NOT be left in place to "match" a stale contract assertion.

- **Rationale**: Spec FR-031 codifies this behavior. The Phase 2
  Complexity Tracking row 2 already records the dispensation; Phase
  4 inherits it.

- **Alternatives considered**:
  - Re-amend the constitution to permit "derived from explicit
    recommendation" — out of scope for Phase 4 (Phase 6 owns the
    discussion per Phase 1 `CR-002`).

## R-014 — Configuration surface

- **Decision**: One new config file `backend/config/salamhack.php`
  consolidates Phase 4's domain configuration:

  ```php
  return [
      'demo_config' => [
          'fee_percent' => env('SALAMHACK_FEE_PERCENT', 2),
          'exchange_rate' => env('SALAMHACK_EXCHANGE_RATE', 1.0),
          'rate_lock_minutes' => env('SALAMHACK_RATE_LOCK_MINUTES', 15),
          'payment_window_minutes' => env('SALAMHACK_PAYMENT_WINDOW_MINUTES', 1),
      ],
      'transaction_defaults' => [
          'source' => env('SALAMHACK_DEFAULT_SOURCE', 'Gaza'),
          'destination' => env('SALAMHACK_DEFAULT_DESTINATION', 'Egypt'),
      ],
      'admin_tokens' => array_filter(array_map(
          'trim',
          explode(',', (string) env('SALAMHACK_ADMIN_TOKENS', ''))
      )),
      'transaction_id_prefix' => env('SALAMHACK_TX_ID_PREFIX', 'TR-'),
  ];
  ```

  `.env.example` is extended with the new keys at their default
  values.

- **Rationale**: Centralising configuration keeps the env surface
  predictable and gives the implementation one place to read from.
  Defaults match the Phase 1 examples (`fee_percent=2`,
  `exchange_rate=1.0`, `rate_lock_minutes=15`) except for
  `payment_window_minutes` which is overridden to `1` for
  development per R-004.

- **Alternatives considered**:
  - Add new keys to `config/app.php` — rejected; pollutes the
    framework default config.
  - Hard-code defaults in the domain layer — rejected; the spec
    requires DemoConfig values to come from a configuration source
    (FR-027).

---

## Open items for downstream phases

These items are **not** Phase 4's concern but are recorded here so
they are not lost:

- **Phase 5**: Replace the singleton `TransactionStore` with an
  Eloquent `TransactionRepository` backed by `transactions` and
  `audit_log_entries` tables. Migrate `processing_payouts_started_at`
  to a real column. The route registry, request bodies, response
  shapes, and status codes MUST NOT change.
- **Phase 6**: Replace `BearerPresenceAuth` with Sanctum issuance,
  validation, and `auth:sanctum` route middleware. Replace the
  config-driven admin allowlist with a credential-backed admin
  scope or `User.is_admin` flag. Wire `EP-015`..`EP-018`. Reconcile
  Phase 1 `CR-002` (auth contract dispensation) per the constitution
  governance process.
- **Phase 7**: Run lazy-settlement on a real scheduler if the
  product moves off `php artisan serve`; production deployments
  cannot rely on a developer's foreground HTTP server to settle
  payouts.
