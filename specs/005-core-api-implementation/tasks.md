---

description: "Task list for implementing Phase 4 — Core API Implementation"
---

# Tasks: Core API Implementation (Phase 4)

**Input**: Design documents from `/specs/005-core-api-implementation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/state-machine.md, quickstart.md

**Tests**: Tests are REQUIRED for this feature. Spec FR-030 and constitution Principle II ("Test-First Development — NON-NEGOTIABLE") mandate that tests are authored before the implementation they exercise, in the same change set. Each user-story phase below lists its tests before its implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Implementer note (read this first)**: Every file path below is **absolute relative to the repo root** (the directory containing `backend/`, `frontend/`, `specs/`, …). Do **not** create files outside `backend/` (other than the `specs/` artefacts already in place). The Phase 1 contract at `specs/002-api-discovery/api-contract.md` is the source of truth for endpoint shapes; the state-machine table at `specs/005-core-api-implementation/contracts/state-machine.md` is the source of truth for transitions; `specs/005-core-api-implementation/data-model.md` lists the domain classes and their fields. When in doubt, read those three files — never invent contract behavior.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to — `US1`, `US2`, `US3`, `US4`. Setup/Foundational/Polish phases have no story label.
- File paths are absolute relative to repo root.

## Path Conventions

This is a web app: backend code lives under `backend/`. Tests live under `backend/tests/`. Specs live under `specs/`. The `frontend/` directory MUST NOT be modified by any task in this list (constitution Principle I; spec FR-026; spec SC-008).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project configuration scaffolding required by every later phase. None of these tasks add domain logic.

- [X] T001 Create `backend/config/salamhack.php` exporting an array with the four sub-keys defined in `specs/005-core-api-implementation/research.md` § R-014: `demo_config` (with `fee_percent`, `exchange_rate`, `rate_lock_minutes`, `payment_window_minutes`), `transaction_defaults` (with `source`, `destination`), `admin_tokens` (parsed from a comma-separated env var into an array), and `transaction_id_prefix`. Each value reads from the corresponding `SALAMHACK_*` env var with the default values listed in research R-014. The file MUST be a single `return [...]` statement and MUST NOT contain any side effects.

- [X] T002 Extend `backend/.env.example` by appending the eight Phase 4 env keys listed in `specs/005-core-api-implementation/quickstart.md` § Prerequisites: `SALAMHACK_FEE_PERCENT=2`, `SALAMHACK_EXCHANGE_RATE=1.0`, `SALAMHACK_RATE_LOCK_MINUTES=15`, `SALAMHACK_PAYMENT_WINDOW_MINUTES=1`, `SALAMHACK_DEFAULT_SOURCE=Gaza`, `SALAMHACK_DEFAULT_DESTINATION=Egypt`, `SALAMHACK_TX_ID_PREFIX=TR-`, `SALAMHACK_ADMIN_TOKENS=admin-demo-token`. Add a brief block comment header `# Phase 4 — Core API Implementation` above the new lines to keep the file readable.

- [X] T003 [P] Create `backend/app/Providers/DomainServiceProvider.php`. The class extends `Illuminate\Support\ServiceProvider`, declares an empty `register()` method (it will be filled in T015 and T027), and an empty `boot()` method. Then register the provider by appending the fully-qualified class name `App\Providers\DomainServiceProvider::class` to the providers list in `backend/bootstrap/providers.php`.

**Checkpoint**: `backend/config/salamhack.php` returns the expected array (verify with `php artisan config:show salamhack` after `php artisan config:clear`); `php artisan tinker` can resolve the provider via `app(\App\Providers\DomainServiceProvider::class)`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain types, value objects, exceptions, Resources, middleware, and the state machine — every later user-story phase depends on these.

**⚠️ CRITICAL**: Do not start any user-story phase before this phase is complete. Within the phase, tasks marked `[P]` may run in parallel because they touch different files; the unmarked tasks have file-level dependencies on earlier tasks.

### Domain enums and value objects

- [X] T004 [P] Create `backend/app/Domain/Transactions/TransactionStatus.php`. A PHP 8.1 string-backed enum with cases for the 11 wire values in `specs/005-core-api-implementation/data-model.md` § TxStatus (`PendingRequest = 'Pending Request'`, `MatchFound = 'Match Found'`, `AwaitingDeposits = 'Awaiting Deposits'`, `DepositConfirmedPartially = 'Deposit Confirmed Partially'`, `BothDepositsConfirmed = 'Both Deposits Confirmed'`, `ProcessingPayouts = 'Processing Payouts'`, `Completed = 'Completed'`, `UnderReview = 'Under Review'`, `Failed = 'Failed'`, `Refunded = 'Refunded'`, `Disputed = 'Disputed'`). Add a public method `isTerminal(): bool` returning `true` for `Completed`, `Failed`, `Refunded` and `false` otherwise. Add a public method `isActive(): bool` returning `! $this->isTerminal()`.

- [X] T005 [P] Create `backend/app/Domain/Transactions/Currency.php`. PHP string-backed enum with cases `USD = 'USD'`, `EGP = 'EGP'`, `ILS = 'ILS'`.

- [X] T006 [P] Create `backend/app/Domain/Transactions/DepositParty.php`. PHP string-backed enum with cases `A = 'A'`, `B = 'B'`.

- [X] T007 [P] Create `backend/app/Domain/Audit/AuditLogEntry.php`. A `final readonly class` with three constructor properties: `public CarbonImmutable $time`, `public string $actor`, `public string $action`. No methods other than the constructor. Use `Carbon\CarbonImmutable` (already available in Laravel 11).

- [X] T008 [P] Create `backend/app/Domain/Users/ActorIdentity.php`. A `final readonly class` with constructor properties `public string $id` and `public bool $isAdmin`. Add a public static method `fromBearerToken(string $token, array $adminTokens): self` that:
  - Computes `$id = 'usr-' . substr(hash('sha256', $token), 0, 12)`.
  - Sets `$isAdmin = true` if `$adminTokens === []` (zero-config dev fallback per research R-005) OR `in_array($token, $adminTokens, true)`.
  - Returns `new self($id, $isAdmin)`.

- [X] T009 Create `backend/app/Domain/Transactions/Transaction.php`. A `final readonly class` with all 16 constructor properties listed in `specs/005-core-api-implementation/data-model.md` § Transaction (PHP value object): `id`, `source`, `destination`, `amount` (float), `currency` (`Currency` enum), `status` (`TransactionStatus` enum), `feePercent` (float), `exchangeRate` (float), `receivableAmount` (float), `createdAt` (`CarbonImmutable`), `depositA` (bool), `depositB` (bool), `disputeReason` (`?string`), `ownerId` (string), `processingPayoutsStartedAt` (`?CarbonImmutable`), `auditLog` (`array` of `AuditLogEntry` — declare PHPDoc `@var list<AuditLogEntry>`). Add a public method `with(...$named): self` that takes named arguments and returns a new `Transaction` with the named fields replaced (use `func_get_args()` is incorrect — use a method signature with explicit nullable defaults for each field, defaulting to a sentinel and overriding only those passed). Simpler: write `with(...)` to take an associative array, e.g. `public function with(array $changes): self`, and merge. Choose whichever idiom is clearer; tests only care about the result. Depends on T004, T005, T007.

### Exceptions and error envelope

- [X] T010 Create three exception classes in parallel files:
  - `backend/app/Exceptions/InvalidStateException.php`: a `final class` extending `RuntimeException`. Constructor: `public function __construct(public readonly string $endpointId, public readonly string $currentStatus, public readonly string $attemptedAction, ?Throwable $previous = null)`. Build the message as `"Invalid state '{$currentStatus}' for action '{$attemptedAction}' on endpoint {$endpointId}."`.
  - `backend/app/Exceptions/ForbiddenAccessException.php`: a `final class` extending `RuntimeException`. Constructor: `public function __construct(public readonly string $reason, ?Throwable $previous = null)`. Message = `"Forbidden: {$reason}"`.
  - `backend/app/Exceptions/OwnershipDeniedException.php`: a `final class` extending `ForbiddenAccessException`. Constructor: `public function __construct(public readonly string $resourceId, ?Throwable $previous = null)`. Pass `parent::__construct("ownership denied for {$resourceId}", $previous);`.

- [X] T011 Extend `backend/app/Support/ErrorEnvelope.php` (existing file) by adding two new public static factory methods that follow the pattern of the existing methods:
  - `public static function invalidState(string $endpointId, string $currentStatus): JsonResponse` — returns `self::response('invalid_state', "The transaction's current state does not permit this action.", Response::HTTP_CONFLICT, ['endpoint_id' => $endpointId, 'current_status' => $currentStatus])`.
  - `public static function forbidden(string $reason): JsonResponse` — returns `self::response('forbidden', 'The authenticated user cannot perform this action.', Response::HTTP_FORBIDDEN, ['reason' => $reason])`.
  Do not modify any existing method.

- [X] T012 Edit `backend/bootstrap/app.php` (existing file). Inside the `withExceptions(function (Exceptions $exceptions): void { ... })` block, add three new `$exceptions->render(...)` callbacks **before** the catch-all `Throwable` callback already at the end:
  - For `App\Exceptions\InvalidStateException`: call `ErrorEnvelope::invalidState($e->endpointId, $e->currentStatus)` and pass the result through `ErrorEnvelope::attachRequestId(..., $request)`.
  - For `App\Exceptions\OwnershipDeniedException`: call `ErrorEnvelope::forbidden("ownership denied for {$e->resourceId}")` and `attachRequestId(...)`.
  - For `App\Exceptions\ForbiddenAccessException`: call `ErrorEnvelope::forbidden($e->reason)` and `attachRequestId(...)`. Order matters: register the more-specific `OwnershipDeniedException` *before* the parent `ForbiddenAccessException` callback. Add `use App\Exceptions\InvalidStateException;`, `use App\Exceptions\ForbiddenAccessException;`, `use App\Exceptions\OwnershipDeniedException;`, and `use App\Support\ErrorEnvelope;` at the top of the file. Depends on T010, T011.

### Domain core (state machine + store + factory + clock)

- [X] T013 [P] Create `backend/app/Domain/Transactions/SettlementClock.php`. A `final class` (NOT readonly — it has no state of its own; the `paymentWindowMinutes` is an int dependency) with constructor `public function __construct(private readonly int $paymentWindowMinutes)`. Methods:
  - `public function shouldSettle(Transaction $tx, CarbonImmutable $now): bool` — returns `true` iff `$tx->status === TransactionStatus::ProcessingPayouts && $tx->processingPayoutsStartedAt !== null && $now->diffInMinutes($tx->processingPayoutsStartedAt, true) >= $this->paymentWindowMinutes`. Use `$now->diffInMinutes($tx->processingPayoutsStartedAt, true)` (absolute) to be tolerant of clock direction.
  - `public function settle(Transaction $tx, CarbonImmutable $now): Transaction` — returns the result of `$tx->with([...])` with `status = TransactionStatus::Completed` and a new `auditLog` array containing all existing entries plus a new `AuditLogEntry($now, 'system', 'payouts_completed')` appended.
  Depends on T009.

- [X] T014 Create `backend/app/Domain/Transactions/TransactionStore.php`. A `final class` with a private `array $byId = []` and a private `int $nextSequence = 1`. Public methods exactly as in `specs/005-core-api-implementation/data-model.md` § TransactionStore: `put(Transaction $tx): void` (assigns `$this->byId[$tx->id] = $tx`); `get(string $id): ?Transaction`; `replace(string $id, Transaction $tx): void` (asserts the key already exists, throws `RuntimeException` otherwise, then assigns); `all(): iterable` (returns `array_values($this->byId)`); `ownedBy(string $ownerId): iterable` (returns `array_values(array_filter($this->byId, fn (Transaction $t) => $t->ownerId === $ownerId))`). Add `peekNextSequence(): int` returning `$this->nextSequence` and `bumpSequence(): int` returning the current `nextSequence` value then incrementing it (used by `TransactionFactory`). Depends on T009.

- [X] T015 Edit `backend/app/Providers/DomainServiceProvider.php` (created in T003). In `register()`, bind `TransactionStore` as a singleton: `$this->app->singleton(\App\Domain\Transactions\TransactionStore::class)` (Laravel will instantiate it once per app lifecycle — exactly one per `php artisan serve` process). Also bind `SettlementClock` as a singleton with the constructor argument resolved from config: `$this->app->singleton(\App\Domain\Transactions\SettlementClock::class, fn () => new \App\Domain\Transactions\SettlementClock((int) config('salamhack.demo_config.payment_window_minutes', 1)));`. Depends on T013, T014.

- [X] T016 Create `backend/app/Domain/Transactions/TransactionFactory.php`. A `final class` with constructor `public function __construct(private readonly TransactionStore $store, private readonly array $demoConfig, private readonly array $transactionDefaults, private readonly string $idPrefix)`. Public methods:
  - `public function nextId(): string` — returns `sprintf('%s%04d', $this->idPrefix, $this->store->bumpSequence())`. The store's monotonic sequence guarantees uniqueness within the process.
  - `public function create(string $ownerId, float $amount, Currency $currency, CarbonImmutable $now): Transaction` — assembles a fully-formed Transaction with: `id` from `nextId()`; `source` from `$this->transactionDefaults['source']`; `destination` from `$this->transactionDefaults['destination']`; `amount` and `currency` from arguments; `status = TransactionStatus::PendingRequest`; `feePercent` and `exchangeRate` from `$this->demoConfig`; `receivableAmount = round($amount * $this->demoConfig['exchange_rate'] * (1 - $this->demoConfig['fee_percent'] / 100), 2)` (research R-010); `createdAt = $now`; `depositA = false`; `depositB = false`; `disputeReason = null`; `ownerId = $ownerId`; `processingPayoutsStartedAt = null`; `auditLog = [new AuditLogEntry($now, $ownerId, 'request_created')]`. Returns the Transaction without persisting (the controller is responsible for `store->put()`).
  Depends on T009, T014.

- [X] T017 Create `backend/app/Domain/Transactions/TransactionStateMachine.php`. A `final class` with no constructor dependencies. Implement one method per row in `specs/005-core-api-implementation/contracts/state-machine.md` Transitions table (T02..T14, NOT T01 which lives in `TransactionFactory`, NOT T07 which lives in `SettlementClock`). Each method signature follows the pattern shown in `specs/005-core-api-implementation/data-model.md` § TransactionStateMachine. The shared shape is:
  ```php
  if ($tx->status->isTerminal()) {
      throw new InvalidStateException(<endpointId>, $tx->status->value, <action>);
  }
  if (! in_array($tx->status, <allowed predecessors>, true)) {
      throw new InvalidStateException(<endpointId>, $tx->status->value, <action>);
  }
  return $tx->with([...new fields..., 'auditLog' => [...$tx->auditLog, new AuditLogEntry($now, $actor->id, '<action verb>')]]);
  ```
  Specifically:
  - `autoMatch(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction` — endpoint `EP-010`; allowed `[PendingRequest]`; result `MatchFound`; verb `auto_matched`.
  - `confirmMatch(...)` — `EP-005`; allowed `[MatchFound]`; result `AwaitingDeposits`; verb `match_confirmed`.
  - `confirmDeposit(Transaction $tx, DepositParty $party, ActorIdentity $actor, CarbonImmutable $now): Transaction` — `EP-006`; allowed `[AwaitingDeposits, DepositConfirmedPartially]`; if `$party === DepositParty::A` and `$tx->depositA === true`, throw `InvalidStateException`; mirror for B; set the matching deposit flag to `true`; new status is `BothDepositsConfirmed` if both flags are true after, else `DepositConfirmedPartially`; verbs `deposit_a_confirmed` or `deposit_b_confirmed`.
  - `processPayouts(...)` — `EP-007`; allowed `[BothDepositsConfirmed]`; result `ProcessingPayouts`; ALSO sets `processingPayoutsStartedAt = $now`; verb `payouts_processing_started`.
  - `cancel(...)` — `EP-004`; allowed `[PendingRequest, MatchFound]`; result `Failed`; verb `cancelled`.
  - `openDispute(Transaction $tx, string $reason, ActorIdentity $actor, CarbonImmutable $now): Transaction` — `EP-008`; allowed = every active state EXCEPT `Disputed` (i.e., `PendingRequest, MatchFound, AwaitingDeposits, DepositConfirmedPartially, BothDepositsConfirmed, ProcessingPayouts, UnderReview`); result `Disputed`; ALSO sets `disputeReason = $reason`; verb `dispute_opened`.
  - `flagRisk(...)` — `EP-011`; allowed = active states except `UnderReview` (i.e., `PendingRequest, MatchFound, AwaitingDeposits, DepositConfirmedPartially, BothDepositsConfirmed, ProcessingPayouts, Disputed`); result `UnderReview`; verb `flagged_for_review`.
  - `approve(...)` — `EP-012`; allowed `[UnderReview]`; result `BothDepositsConfirmed`; verb `admin_approved`.
  - `refund(...)` — `EP-013`; allowed = every active state (terminal-state guard catches the rest); result `Refunded`; verb `admin_refunded`.
  - `resolveDispute(Transaction $tx, string $outcome, ActorIdentity $actor, CarbonImmutable $now): Transaction` — `EP-014`; allowed `[Disputed]`; if `$outcome === 'Completed'`, result `Completed` and verb `dispute_resolved_completed`; if `$outcome === 'Refunded'`, result `Refunded` and verb `dispute_resolved_refunded`; for any other `$outcome`, throw `InvalidArgumentException` (caller's `FormRequest` should have caught this — defense in depth). Depends on T009, T010.

### Domain unit tests (TDD — write before any feature test consumes them)

- [X] T018 [P] Create `backend/tests/Unit/Domain/Transactions/TransactionStateMachineTest.php`. A Pest test file that exercises every row T02..T14 of `specs/005-core-api-implementation/contracts/state-machine.md` Transitions table. Use a small helper at the top of the file:
  ```php
  function makeTx(TransactionStatus $status, bool $depositA = false, bool $depositB = false, ?CarbonImmutable $startedAt = null, ?string $disputeReason = null): Transaction { /* build with fixed defaults */ }
  function actor(): ActorIdentity { return new ActorIdentity('usr-test1234abcd', false); }
  function now(): CarbonImmutable { return CarbonImmutable::parse('2026-04-30T12:00:00Z'); }
  ```
  For each transition, write at minimum:
  - `it('<verb>: transitions <FromState> to <ToState>')` — the legal case.
  - `it('<verb>: rejects from <every other allowed-state-set member of a representative illegal state>')` — at least one illegal-state case per transition.
  - For `confirmDeposit`: cover the four cases (party=A on AwaitingDeposits with depositA=false → DepositConfirmedPartially; party=A on DepositConfirmedPartially with depositA=false depositB=true → BothDepositsConfirmed; party=A on AwaitingDeposits with depositA=true → InvalidStateException; mirror for B).
  - One test asserting that calling any state-changing method on a terminal transaction (`Completed`, `Failed`, `Refunded`) throws `InvalidStateException` regardless of the specific action. Iterate across all 9 state-machine methods inside one test.
  All assertions are made on the returned `Transaction`'s `status`, deposit flags, `disputeReason` (when relevant), and the *length* and *last-entry action* of the resulting `auditLog` (verifying spec FR-018: exactly one new entry per successful call). Depends on T017.

- [X] T019 [P] Create `backend/tests/Unit/Domain/Transactions/TransactionFactoryTest.php`. Pest tests asserting:
  - The factory issues IDs in the `TR-####` format with monotonic sequencing across 3 successive `create()` calls.
  - `create()` sets `status` to `PendingRequest`, `depositA`/`depositB` to `false`, `auditLog` to a single-entry array whose action is `request_created`, `feePercent` and `exchangeRate` to the values passed in constructor, and `receivableAmount` to `round(amount * exchangeRate * (1 - feePercent / 100), 2)`.
  - The wire enums round-trip: `Currency::USD` is preserved on the Transaction.
  Depends on T016.

- [X] T020 [P] Create `backend/tests/Unit/Domain/Transactions/SettlementClockTest.php`. Pest tests asserting:
  - `shouldSettle()` returns `false` for a Transaction not in `ProcessingPayouts`.
  - `shouldSettle()` returns `false` when the elapsed time is less than `paymentWindowMinutes`.
  - `shouldSettle()` returns `true` when the elapsed time is greater than or equal to `paymentWindowMinutes`.
  - `settle()` returns a Transaction with `status = Completed` and a final `auditLog` entry whose `action = 'payouts_completed'` and `actor = 'system'`.
  Depends on T013.

### HTTP layer prerequisites (Resources, FormRequests, middleware)

- [X] T021 [P] Create `backend/app/Http/Resources/AuditLogEntryResource.php`. Extends `Illuminate\Http\Resources\Json\JsonResource`. `toArray($request)` returns `['time' => $this->time->toIso8601ZuluString(), 'actor' => $this->actor, 'action' => $this->action]`. Inside the resource, `$this` is the wrapped `AuditLogEntry`, so the property accesses go through the resource's magic `__get`. Depends on T007.

- [X] T022 [P] Create `backend/app/Http/Resources/TransactionResource.php`. Extends `JsonResource`. `toArray($request)` returns the 14 wire-visible fields exactly as listed in `specs/005-core-api-implementation/research.md` § R-008: `id`, `source`, `destination`, `amount`, `currency` (use `$this->currency->value`), `status` (`$this->status->value`), `feePercent`, `exchangeRate`, `receivableAmount`, `createdAt` (`$this->createdAt->toIso8601ZuluString()`), `depositA`, `depositB`, `disputeReason` (nullable, emit as-is), `auditLog` (use `AuditLogEntryResource::collection($this->auditLog)`). DO NOT emit `ownerId` or `processingPayoutsStartedAt` — they are not wire-visible. Depends on T009, T021.

- [X] T023 [P] Create `backend/app/Http/Resources/TransactionCollection.php`. Extends `Illuminate\Http\Resources\Json\ResourceCollection`. Set `public $collects = TransactionResource::class;`. Override `toArray($request)` to return `['transactions' => $this->collection]`. (This wraps the underlying collection in the `{ "transactions": [...] }` envelope used by `EP-001` and `EP-009`.) Depends on T022.

- [X] T024 [P] Create `backend/app/Http/Requests/EmptyBodyRequest.php`. Extends `Illuminate\Foundation\Http\FormRequest`. `authorize()` returns `true`. `rules()` returns `[]`. Add an override of `validateResolved()` (or a `withValidator(Validator $validator)` callback) that asserts `count($this->json()->all()) === 0` after stripping a single allowed empty object `{}`; if the body has any top-level keys, fail validation with a synthetic message under the `body` key so the central `ValidationException → validation_failed` envelope handler from Phase 2 fires. Acceptable simpler shape: `protected function failedValidation(...)` is unnecessary here — use `withValidator(fn ($v) => $v->after(fn ($v) => count($this->all()) > 0 ? $v->errors()->add('body', 'Request body must be empty.') : null))`.

- [X] T025 [P] Create `backend/app/Http/Middleware/AdminGuard.php`. A class with a `public function handle(Request $request, Closure $next): Response` method. Read the bearer token from `$request->bearerToken()`. Read the admin allowlist from `config('salamhack.admin_tokens')`. Construct `$actor = ActorIdentity::fromBearerToken($token ?? '', $allowlist ?? [])`. If `! $actor->isAdmin`, throw `new ForbiddenAccessException('admin role required')`. Otherwise call `return $next($request);`. Depends on T008, T010.

- [X] T026 Edit `backend/bootstrap/app.php` (existing file). Inside the `withMiddleware(function (Middleware $middleware): void { ... })` block, extend the `$middleware->alias([...])` array to add `'admin.guard' => \App\Http\Middleware\AdminGuard::class`. Do not remove existing aliases. Depends on T025.

- [X] T027 [P] Edit `backend/app/Providers/DomainServiceProvider.php` (filled in T015). In `register()`, additionally bind a request-scoped factory for `ActorIdentity` keyed by request: `$this->app->bind(ActorIdentity::class, function ($app) { $request = $app->make(\Illuminate\Http\Request::class); $token = $request->bearerToken() ?? ''; $allowlist = (array) config('salamhack.admin_tokens', []); return ActorIdentity::fromBearerToken($token, $allowlist); });`. Note: this is **not** a singleton — every controller invocation that type-hints `ActorIdentity` resolves a fresh value bound to the current request. Also bind `TransactionFactory` as a singleton-per-process: `$this->app->singleton(\App\Domain\Transactions\TransactionFactory::class, fn ($app) => new \App\Domain\Transactions\TransactionFactory($app->make(\App\Domain\Transactions\TransactionStore::class), (array) config('salamhack.demo_config'), (array) config('salamhack.transaction_defaults'), (string) config('salamhack.transaction_id_prefix', 'TR-')));`. Add `TransactionStateMachine` as a simple binding: `$this->app->bind(\App\Domain\Transactions\TransactionStateMachine::class);`. Depends on T008, T015, T016, T017.

**Checkpoint**: Foundation ready. Run `cd backend && vendor/bin/pest tests/Unit` — the three unit-test files (T018, T019, T020) should now all pass against the corresponding domain classes. The Phase 3 contract suite still reports 14 stub failures (the controllers still return 501); that's expected.

---

## Phase 3: User Story 1 — Send money + auto-match (Priority: P1) 🎯 MVP

**Goal**: A sender can list their transactions, create a new transfer, request an auto-match, and read the resulting transaction by id. Spec FR-001, FR-007, FR-008, FR-019, FR-020 endpoints `EP-001`, `EP-002`, `EP-003`, `EP-010`.

**Independent Test**: From a fresh backend with no prior data, run the curl sequence in `specs/005-core-api-implementation/quickstart.md` § 3a–3c plus 3k (ownership rejection). All four endpoints respond with the documented success or error envelope.

### Tests for User Story 1 ⚠️ Write FIRST — they MUST fail before implementation

- [X] T028 [P] [US1] Create `backend/tests/Feature/Transactions/CreateTransactionTest.php`. Pest feature tests against `POST /transactions`:
  - Success: `it('creates a transaction with status Pending Request')` — sets `Authorization: Bearer demo-token-1` and `Content-Type: application/json`, posts `{"amount": 750, "currency": "USD"}`, asserts response is HTTP 201 with JSON body whose `status === 'Pending Request'`, `id` matches `/^TR-\d{4}$/`, `currency === 'USD'`, `amount === 750`, `feePercent === 2`, `exchangeRate === 1.0`, `receivableAmount === 735`, `depositA === false`, `depositB === false`, `auditLog[0].action === 'request_created'`, and `auditLog` length is 1.
  - Auth: `it('rejects anonymous requests with 401 unauthenticated')` — no `Authorization` header → asserts HTTP 401 with `error.code === 'unauthenticated'`.
  - Validation: `it('rejects amount <= 0 with 422')`, `it('rejects unknown currency with 422')` — assert HTTP 422 with `error.code === 'validation_failed'`.
  - Drops client-supplied id: `it('ignores client-supplied id field')` — posts `{"id": "TR-9999", "amount": 1, "currency": "USD"}`, asserts the returned `id` does NOT equal `TR-9999`.
  Use `TestCase` from `backend/tests/TestCase.php`; tests run against the Laravel test app and the singleton store is reset per test by Pest's default Laravel test bootstrap. If isolation fails, in `beforeEach()` resolve and clear the store: `app(TransactionStore::class)`'s state is fresh per Pest test only when the test container is rebuilt; if the store leaks, add `beforeEach(fn () => app()->forgetInstance(TransactionStore::class))` at the top of the file.

- [X] T029 [P] [US1] Create `backend/tests/Feature/Transactions/ListTransactionsTest.php`. Pest tests:
  - Empty: `it('returns an empty transactions array when the caller has no transactions')` — GET `/transactions` with `Bearer demo-token-1`; asserts HTTP 200 with body `{"transactions": []}`.
  - Owned-only: `it('returns only the caller\'s transactions')` — first POST a transaction as `Bearer demo-token-1`, then POST one as `Bearer demo-token-2`, then GET `/transactions` as `Bearer demo-token-1`; asserts the response contains exactly one transaction and its id matches the first post's id.
  - Auth: `it('rejects anonymous requests with 401')`.

- [X] T030 [P] [US1] Create `backend/tests/Feature/Transactions/ShowTransactionTest.php`. Pest tests:
  - `it('returns the transaction by id for its owner')` — POST a transaction; GET `/transactions/{id}`; asserts HTTP 200 with the transaction body.
  - `it('returns 404 not_found for an unknown id')`.
  - `it('returns 403 forbidden when accessing another user\'s transaction')` — POST as user A; GET that id as user B; assert HTTP 403 with `error.code === 'forbidden'`.
  - `it('rejects anonymous requests with 401')`.

- [X] T031 [P] [US1] Create `backend/tests/Feature/Transactions/AutoMatchTest.php`. Pest tests:
  - `it('transitions Pending Request to Match Found')` — POST a transaction; POST `/transactions/{id}/auto-match`; assert HTTP 200, status `Match Found`, audit log gains `auto_matched`.
  - `it('returns 409 invalid_state when called against Match Found')` — POST a tx, auto-match, auto-match again; assert HTTP 409 with `error.code === 'invalid_state'`.
  - `it('returns 404 not_found for unknown id')`.
  - `it('returns 403 forbidden for another user\'s transaction')`.
  - `it('rejects anonymous requests with 401')`.

### Implementation for User Story 1

- [X] T032 [P] [US1] Create `backend/app/Http/Requests/StoreTransactionRequest.php`. Extends `FormRequest`. `authorize() => true`. `rules()` returns `['amount' => ['required', 'numeric', 'gt:0'], 'currency' => ['required', 'string', 'in:USD,EGP,ILS']]`. Override `validated($key = null, $default = null)` to return only the validated fields (default behavior is fine — the `id` is not in the rules so it is dropped).

- [X] T033 [US1] Edit `backend/app/Http/Controllers/TransactionController.php` (existing file). Replace the body of the `store` method to:
  1. Type-hint constructor injection in a controller `__construct(private readonly TransactionFactory $factory, private readonly TransactionStore $store, private readonly ActorIdentity $actor)` — add this constructor; remove the `use ReturnsNotImplemented` line and the `notImplemented(...)` body once every method is replaced (do this incrementally per method as we go; for now, keep the trait until later methods are replaced).
  2. Replace `store()` body with: validate via a typed `StoreTransactionRequest $request` parameter (Laravel resolves it); `$tx = $this->factory->create($this->actor->id, (float) $request->validated('amount'), Currency::from($request->validated('currency')), CarbonImmutable::now());`; `$this->store->put($tx);` `return (new TransactionResource($tx))->response()->setStatusCode(201);`.
  3. Remove `EP-003` from the `notImplemented` list — add `use App\Http\Requests\StoreTransactionRequest;`, `use App\Http\Resources\TransactionResource;`, `use App\Domain\Transactions\Currency;`, `use Carbon\CarbonImmutable;`, etc.
  Depends on T009, T015, T016, T022, T027, T032.

- [X] T034 [US1] Edit `backend/app/Http/Controllers/TransactionController.php` again. Replace the body of `index()` to: pass through the lazy-settlement step (see T046; for now the impl can call it inline or directly emit the un-settled list — but since US2 hasn't introduced settlement yet, just return owned transactions as-is): `return new TransactionCollection($this->store->ownedBy($this->actor->id));`. Depends on T023, T033.

- [X] T035 [US1] Edit `backend/app/Http/Controllers/TransactionController.php` again. Replace the body of `show(string $id)` to: `$tx = $this->store->get($id);` `if ($tx === null) { throw new NotFoundHttpException(); }` (the Phase 2 exception handler renders this as the canonical `not_found` envelope) `if (! $this->actor->isAdmin && $tx->ownerId !== $this->actor->id) { throw new OwnershipDeniedException($id); }` `return new TransactionResource($tx);`. Add `use App\Exceptions\OwnershipDeniedException;` and `use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;`. Depends on T010, T012, T022, T033.

- [X] T036 [US1] Edit `backend/app/Http/Controllers/TransactionController.php` again. Replace the body of `autoMatch(string $id)` to: load the transaction (`get → 404`), enforce ownership (`OwnershipDeniedException` for non-owners), call `$updated = $this->stateMachine->autoMatch($tx, $this->actor, CarbonImmutable::now());`, `$this->store->replace($id, $updated);` `return new TransactionResource($updated);`. Add `TransactionStateMachine $stateMachine` to the controller's constructor and update the type-hint accordingly. Add `use App\Domain\Transactions\TransactionStateMachine;`. Depends on T017, T027, T035.

- [X] T037 [US1] Run the four feature tests for US1 (`vendor/bin/pest --filter "Create|List|Show|AutoMatch"` from `backend/`) and confirm they all pass. If any test fails, debug the implementation file referenced in the failing test rather than the test itself (constitution Principle II — tests are authoritative).

**Checkpoint**: User Story 1 is fully functional. Spec SC-001 partial (4/9 user-journey endpoints pass). Phase 3 contract suite reports 4 of the 14 product endpoints passing (`EP-001`, `EP-002`, `EP-003`, `EP-010`). The MVP demo can run the steps in quickstart.md § 3a–3c.

---

## Phase 4: User Story 2 — Deposit + payout cycle (Priority: P1)

**Goal**: A sender with a `Match Found` transaction can confirm both deposits, request payout processing, and observe the transaction reach `Completed`. Spec FR-009, FR-010, FR-011, FR-018 endpoints `EP-005`, `EP-006`, `EP-007`. Adds the lazy `Processing Payouts → Completed` settlement step on read.

**Independent Test**: Run the curl sequence in `specs/005-core-api-implementation/quickstart.md` § 3d–3i (assumes US1 is in place). The audit log at the end of step 3i contains all 7 actions in order.

### Tests for User Story 2 ⚠️ Write FIRST

- [X] T038 [P] [US2] Create `backend/tests/Feature/Transactions/ConfirmMatchTest.php`. Pest tests:
  - `it('transitions Match Found to Awaiting Deposits')` — set up a tx in `Match Found` state (call `POST /transactions` then `POST .../auto-match`), then `POST .../confirm-match`; assert HTTP 200, status `Awaiting Deposits`, audit log gains `match_confirmed`.
  - `it('returns 409 from Pending Request')`.
  - `it('returns 409 from Awaiting Deposits (already past)')`.
  - `it('returns 404 unknown id')`.
  - `it('returns 403 for another user')`.

- [X] T039 [P] [US2] Create `backend/tests/Feature/Transactions/ConfirmDepositTest.php`. Pest tests:
  - `it('confirms party A and reaches Deposit Confirmed Partially')`.
  - `it('confirms party B from Deposit Confirmed Partially and reaches Both Deposits Confirmed')`.
  - `it('returns 409 when confirming the same party twice')` — call with `party=A` twice; second call MUST be 409.
  - `it('returns 422 for missing party')`, `it('returns 422 for invalid party value')`.
  - `it('returns 409 from Match Found (not yet in Awaiting Deposits)')`.
  - `it('returns 404 unknown id')`, `it('returns 403 for another user')`.

- [X] T040 [P] [US2] Create `backend/tests/Feature/Transactions/ProcessPayoutsTest.php`. Pest tests:
  - `it('returns Processing Payouts immediately')` — set up a tx in `Both Deposits Confirmed` state; `POST .../process-payouts`; assert HTTP 200, status `Processing Payouts`, audit log gains `payouts_processing_started`.
  - `it('settles to Completed on read after the settlement window')` — use Carbon test-time travel: `Carbon::setTestNow(...)` at the time of the process-payouts call; advance by `paymentWindowMinutes + 1`; `Carbon::setTestNow($future)`; `GET /transactions/{id}`; assert status is `Completed` and audit log's last entry is `payouts_completed` with `actor === 'system'`. Use `CarbonImmutable::setTestNow(...)` and reset in `afterEach`.
  - `it('does not settle before the window has elapsed')` — same setup, advance by half the window only, GET the tx; status remains `Processing Payouts`.
  - `it('returns 409 from Awaiting Deposits (not enough deposits confirmed)')`.
  - `it('returns 404 unknown id')`, `it('returns 403 for another user')`.

### Implementation for User Story 2

- [X] T041 [P] [US2] Create `backend/app/Http/Requests/ConfirmDepositRequest.php`. Extends `FormRequest`. `authorize() => true`. `rules()` returns `['party' => ['required', 'string', 'in:A,B']]`.

- [X] T042 [US2] Edit `backend/app/Http/Controllers/TransactionController.php` again. Replace `confirmMatch(string $id)` body with the same shape as `autoMatch` (T036) but calling `$this->stateMachine->confirmMatch(...)` and using `EmptyBodyRequest` as the typed FormRequest parameter (rejects bodies with extra keys per T024). Depends on T024, T036.

- [X] T043 [US2] Edit `backend/app/Http/Controllers/TransactionController.php` again. Replace `confirmDeposit(string $id)` body. Type-hint a `ConfirmDepositRequest $request` parameter. After the load+ownership pattern, call `$updated = $this->stateMachine->confirmDeposit($tx, DepositParty::from($request->validated('party')), $this->actor, CarbonImmutable::now());`, store, and return the Resource. Add `use App\Domain\Transactions\DepositParty;` and `use App\Http\Requests\ConfirmDepositRequest;`. Depends on T006, T036, T041.

- [X] T044 [US2] Edit `backend/app/Http/Controllers/TransactionController.php` again. Replace `processPayouts(string $id)` body identically to `confirmMatch` but calling `$this->stateMachine->processPayouts(...)`. Use `EmptyBodyRequest`. Depends on T036.

### Lazy settlement on read

- [X] T045 [US2] Edit `backend/app/Domain/Transactions/TransactionStore.php` (existing file from T014). Add a new constructor-injected `private SettlementClock $clock` dependency. (Update the binding in `DomainServiceProvider` if needed — the store is already a singleton, but Laravel's container resolves nested deps automatically.) Add a private method `settleIfDue(Transaction $tx): Transaction` that returns `$this->clock->shouldSettle($tx, CarbonImmutable::now()) ? $this->clock->settle($tx, CarbonImmutable::now()) : $tx`. After computing the settled value, if it differs from `$tx`, call `$this->byId[$tx->id] = $settled;` so subsequent reads see the new state without recomputing. Then update `get()` and the iterables in `all()` and `ownedBy()` to map each result through `settleIfDue()` before returning. (The `put()` and `replace()` methods do NOT need to call `settleIfDue` — settlement only fires on read.) Depends on T013, T014, T015.

- [X] T046 [US2] Run the three feature tests for US2 (`vendor/bin/pest --filter "ConfirmMatch|ConfirmDeposit|ProcessPayouts"`) and confirm all pass. Also re-run US1 tests; they should all still pass.

**Checkpoint**: The end-to-end demo journey (quickstart.md § 3a–3i) works. Spec SC-001 fully met (9/9 user-journey endpoints pass). Phase 3 contract suite reports 7 of 14 product endpoints passing (`EP-001`, `EP-002`, `EP-003`, `EP-005`, `EP-006`, `EP-007`, `EP-010`). Lazy settlement closes US2.

---

## Phase 5: User Story 3 — Cancel + dispute (Priority: P2)

**Goal**: A sender can cancel a pre-deposit transaction or open a dispute on any active transaction. Spec FR-012, FR-013 endpoints `EP-004`, `EP-008`.

**Independent Test**: Curl sequence in quickstart.md § 3j (cancel-from-Completed → 409) plus a happy-path cancel from `Pending Request` and a happy-path dispute from `Awaiting Deposits` (not in quickstart.md — the implementer adds these as one-off curls).

### Tests for User Story 3 ⚠️ Write FIRST

- [X] T047 [P] [US3] Create `backend/tests/Feature/Transactions/CancelTransactionTest.php`. Pest tests:
  - `it('cancels a Pending Request transaction')` — POST tx, POST `.../cancel`; assert HTTP 200, status `Failed`, audit log gains `cancelled`.
  - `it('cancels a Match Found transaction')` — POST tx, auto-match, cancel; assert HTTP 200, status `Failed`.
  - `it('returns 409 from Awaiting Deposits')` — set up post-confirm-match, attempt cancel; assert 409.
  - `it('returns 409 from Completed')`, `it('returns 409 from Failed')`.
  - `it('returns 404 unknown id')`, `it('returns 403 for another user')`.

- [X] T048 [P] [US3] Create `backend/tests/Feature/Transactions/OpenDisputeTest.php`. Pest tests:
  - `it('opens a dispute from Awaiting Deposits')` — set up tx, auto-match, confirm-match, then `POST .../disputes` with `{"reason": "deposit not received"}`; assert HTTP 200, status `Disputed`, `disputeReason === 'deposit not received'`, audit log gains `dispute_opened`.
  - `it('opens a dispute from Pending Request')` — post tx, dispute; assert 200.
  - `it('returns 422 for missing reason')`, `it('returns 422 for empty reason')`.
  - `it('returns 409 from Disputed (already disputed)')`.
  - `it('returns 409 from Completed')`.
  - `it('returns 404 unknown id')`, `it('returns 403 for another user')`.

### Implementation for User Story 3

- [X] T049 [P] [US3] Create `backend/app/Http/Requests/OpenDisputeRequest.php`. Extends `FormRequest`. `authorize() => true`. `rules()` returns `['reason' => ['required', 'string', 'min:1']]`.

- [X] T050 [US3] Edit `backend/app/Http/Controllers/TransactionController.php` again. Replace `cancel(string $id)` with the standard pattern (load + ownership + state-machine call + replace + Resource). Use `EmptyBodyRequest` as the typed parameter. Calls `$this->stateMachine->cancel(...)`. Depends on T036.

- [X] T051 [US3] Edit `backend/app/Http/Controllers/TransactionController.php` again. Replace `openDispute(string $id)` body. Type-hint `OpenDisputeRequest $request`. Call `$this->stateMachine->openDispute($tx, $request->validated('reason'), $this->actor, CarbonImmutable::now());`. Add `use App\Http\Requests\OpenDisputeRequest;`. Depends on T036, T049.

- [X] T052 [US3] Run the two feature tests for US3 and confirm pass; re-run US1 + US2; all should pass. After this task, the `TransactionController` has no remaining `notImplemented(...)` bodies — remove the `use ReturnsNotImplemented` line and the import. Phase 3 contract suite now reports 9/9 user-journey endpoints passing.

**Checkpoint**: All sender-facing endpoints work. Phase 3 contract suite reports 9 of 14 product endpoints passing. Spec SC-001 holds at 100%.

---

## Phase 6: User Story 4 — Admin review and resolution (Priority: P3)

**Goal**: An admin can list across users (with optional status filter), flag for risk, approve, refund, and resolve disputes. Spec FR-014, FR-015, FR-016, FR-017, FR-021, FR-022 endpoints `EP-009`, `EP-011`..`EP-014`.

**Independent Test**: Curl sequence in quickstart.md § 3l. Includes the negative path where a non-admin caller hits `/admin/transactions` and gets 403.

### Tests for User Story 4 ⚠️ Write FIRST

- [X] T053 [P] [US4] Create `backend/tests/Feature/Admin/ListAdminTransactionsTest.php`. Pest tests using the admin token `'admin-demo-token'` from the `.env.example` default:
  - `it('returns transactions across users')` — POST a tx as user A, POST as user B, GET `/admin/transactions` as admin; assert response contains 2 transactions.
  - `it('filters by status')` — same setup; GET `/admin/transactions?status=Pending Request`; assert filtered count equals 2 (both new transactions are `Pending Request`).
  - `it('rejects non-admin callers with 403')`.
  - `it('rejects anonymous callers with 401')`.
  - Note: when `SALAMHACK_ADMIN_TOKENS` is empty in test env, every authenticated caller is admin (research R-005). Tests MUST set `SALAMHACK_ADMIN_TOKENS=admin-demo-token` via `phpunit.xml` env block or via `config()->set('salamhack.admin_tokens', ['admin-demo-token'])` in a `beforeEach`.

- [X] T054 [P] [US4] Create `backend/tests/Feature/Admin/FlagRiskTest.php`. Pest tests:
  - `it('flags an active transaction to Under Review')`.
  - `it('returns 409 when called on a Completed transaction')`.
  - `it('rejects non-admin callers with 403')`.

- [X] T055 [P] [US4] Create `backend/tests/Feature/Admin/ApproveTransactionTest.php`. Pest tests:
  - `it('approves an Under Review transaction back to Both Deposits Confirmed')` — set up via flag-risk on a `Both Deposits Confirmed` tx, then approve.
  - `it('returns 409 when called on a Pending Request transaction')`.
  - `it('rejects non-admin callers with 403')`.

- [X] T056 [P] [US4] Create `backend/tests/Feature/Admin/RefundTransactionTest.php`. Pest tests:
  - `it('refunds an active transaction')`.
  - `it('returns 409 when called on a Failed transaction')`.
  - `it('rejects non-admin callers with 403')`.

- [X] T057 [P] [US4] Create `backend/tests/Feature/Admin/ResolveDisputeTest.php`. Pest tests:
  - `it('resolves a dispute with outcome Completed')` — set up open-dispute, then resolve with `{"outcome": "Completed"}`; assert status `Completed`.
  - `it('resolves a dispute with outcome Refunded')`.
  - `it('returns 409 from a non-Disputed transaction')`.
  - `it('returns 422 for missing or invalid outcome')`.
  - `it('rejects non-admin callers with 403')`.

### Implementation for User Story 4

- [X] T058 [P] [US4] Create `backend/app/Http/Requests/ResolveDisputeRequest.php`. Extends `FormRequest`. `rules()` returns `['outcome' => ['required', 'string', 'in:Completed,Refunded']]`.

- [X] T059 [P] [US4] Create `backend/app/Http/Requests/IndexAdminTransactionsRequest.php`. Extends `FormRequest`. `rules()` returns `['status' => ['sometimes', 'string', 'in:Pending Request,Match Found,Awaiting Deposits,Deposit Confirmed Partially,Both Deposits Confirmed,Processing Payouts,Completed,Under Review,Failed,Refunded,Disputed']]`.

- [X] T060 [US4] Edit `backend/routes/api.php` (existing file). Wrap the five admin routes (the lines registering `EP-009`, `EP-011`, `EP-012`, `EP-013`, `EP-014`) inside an inner `Route::middleware('admin.guard')->group(function (): void { ... });` nested within the existing `auth.bearer.presence` group. Path/method registrations MUST remain identical to the Phase 2 route registry (spec SC-004) — this task only adds middleware, never changes paths or methods. Depends on T026.

- [X] T061 [US4] Edit `backend/app/Http/Controllers/AdminTransactionController.php` (existing file). Add a `__construct(private readonly TransactionStore $store, private readonly TransactionStateMachine $stateMachine, private readonly ActorIdentity $actor)` constructor. The `AdminGuard` middleware (T025) has already enforced `$actor->isAdmin === true` by the time any method here runs — no further admin check is needed inside the controller. Replace each method body:
  - `index(IndexAdminTransactionsRequest $request)`: read `$status = $request->validated('status');`. Get `$all = $this->store->all();`. If `$status !== null`, filter by `fn (Transaction $t) => $t->status->value === $status`. Return `new TransactionCollection($all)`.
  - `flagRisk(string $id, EmptyBodyRequest $request)`: standard load-and-replace pattern (NO ownership check — admin actions cross users). Calls `$this->stateMachine->flagRisk(...)`.
  - `approve(string $id, EmptyBodyRequest $request)`: standard load-and-replace; calls `approve(...)`.
  - `refund(string $id, EmptyBodyRequest $request)`: standard load-and-replace; calls `refund(...)`.
  - `resolveDispute(string $id, ResolveDisputeRequest $request)`: standard load-and-replace; calls `resolveDispute($tx, $request->validated('outcome'), $this->actor, CarbonImmutable::now())`.
  Remove `use ReturnsNotImplemented` and the trait usage. Add `use App\Domain\Transactions\TransactionStore;`, `use App\Domain\Transactions\TransactionStateMachine;`, `use App\Domain\Users\ActorIdentity;`, `use App\Http\Resources\TransactionResource;`, `use App\Http\Resources\TransactionCollection;`, `use App\Http\Requests\IndexAdminTransactionsRequest;`, `use App\Http\Requests\EmptyBodyRequest;`, `use App\Http\Requests\ResolveDisputeRequest;`, `use Carbon\CarbonImmutable;`, `use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;`. Depends on T009, T014, T017, T022, T023, T024, T058, T059.

- [X] T062 [US4] Run all five admin feature tests; assert all pass. Re-run US1, US2, US3 tests; all should still pass. Phase 3 contract suite now reports 14/14 user+admin product endpoints passing (`EP-001`..`EP-014`) and 4 expected stub failures (`EP-015`..`EP-018`).

**Checkpoint**: Spec SC-001, SC-002 met (100% of user-journey AND admin-journey endpoints work). Spec SC-003 met (Phase 3 contract suite reports 14/4 split).

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and any cleanup.

- [X] T063 Run the full backend test suite from `backend/`: `vendor/bin/pest`. Confirm all tests pass (Phase 2 foundation tests + new Phase 4 unit and feature tests). If any Phase 2 test fails, the change has regressed the foundation and the offending edit must be reverted or fixed.

- [ ] T064 Run the Phase 3 contract suite (path: whatever Phase 3 set up, typically `vendor/bin/pest tests/Contract` from `backend/`). Confirm: 14 passing endpoint groups (`EP-001`..`EP-014`), 4 expected stub failures (`EP-015`..`EP-018`), 0 unexpected contract failures, 0 environment failures. The default contract-test command MUST exit 0 (spec FR-029, SC-003, SC-004a, SC-009).

- [X] T065 [P] Verify the route registry has not drifted. Run `php artisan route:list --json` from `backend/` and confirm the 18 product routes plus `/healthz` match the path/method list in `specs/003-backend-foundation/contracts/route-registry.md`. The path and method columns MUST match exactly; the controller-action column may differ for admin routes if T060 added the `admin.guard` middleware (which is allowed; admin route handlers' Controller@Action remains unchanged). If `php artisan route:list` shows any new routes or any path drift, undo the offending change.

- [X] T066 [P] Verify zero `frontend/` modifications. Run `git diff main..HEAD --stat -- frontend/` from the repo root. The output MUST be empty (spec SC-008). If any frontend file is touched, revert it.

- [X] T067 [P] Walk the demo user journey by hand using `specs/005-core-api-implementation/quickstart.md` § 3 with `SALAMHACK_PAYMENT_WINDOW_MINUTES=1`. The full happy path (3a–3i) MUST complete in under 90 seconds (spec SC-005). The audit log at the end MUST contain exactly the 7 actions in the order documented in step 3i.

- [ ] T068 [P] Confirm the demo-path latency budget (spec SC-010). With an empty in-memory store, the create / auto-match / confirm-match / confirm-deposit / process-payouts endpoints respond within 200 ms p95 on a developer laptop. Quick check: time each curl invocation in quickstart.md § 3 with `\`time` or your shell's equivalent.

- [X] T069 If any audit-log assertion fails because of timezone formatting drift (Phase 1's example uses `.000Z`, Carbon's default produces `+00:00`), fix `TransactionResource` and `AuditLogEntryResource` to use `toIso8601ZuluString()` (returns `…Z`). Do NOT relax test assertions to match a non-conforming format (constitution Principle II — tests are authoritative).

- [X] T070 Final lint pass: from `backend/`, run `vendor/bin/pint --test`. If any file fails the style check, run `vendor/bin/pint` to fix and re-run the test suite to confirm no behavior change.

**Checkpoint**: Phase 4 is complete. The branch is ready for review. Spec SC-001 through SC-012 all hold.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user-story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational. Independently testable.
- **User Story 2 (Phase 4)**: Depends on Foundational. Builds on US1 conceptually but tests reuse US1 endpoints to set up state — finish US1 first to keep the test setup straightforward.
- **User Story 3 (Phase 5)**: Depends on Foundational. Independently testable; reuses US1 to construct test state.
- **User Story 4 (Phase 6)**: Depends on Foundational. Independently testable; reuses US1/US2 to construct test state.
- **Polish (Phase 7)**: Depends on whichever stories are intended for delivery. The route-registry / no-frontend-edit checks are valid after any single user story.

### Within Each User Story

- The tests listed under "Tests for User Story X" MUST be written FIRST. Run them and confirm they FAIL because the implementation does not yet exist.
- THEN write the FormRequest classes (`[P]` tasks within the story).
- THEN replace the controller method bodies.
- Re-run the story's tests; confirm pass.
- Re-run all previous stories' tests; confirm no regression.

### Parallel Opportunities

- All `[P]`-marked tasks within a phase touch different files and may run concurrently.
- Within Phase 2, the enums (T004, T005, T006), AuditLogEntry (T007), ActorIdentity (T008), Resources (T021, T022, T023), AdminGuard (T025), and EmptyBodyRequest (T024) are independent and may all run in parallel after T001..T003 finish. Transaction (T009), Exceptions (T010), and ErrorEnvelope (T011) depend on the enums and may run in parallel with Resources etc. once those are merged. The state machine (T017), factory (T016), store (T014), and clock (T013) form one short serial chain.
- Within each user-story phase, the test files are all `[P]` and may run concurrently. The FormRequest creation tasks are `[P]`. The controller-edit tasks are NOT `[P]` because every story phase edits the same `TransactionController.php` file (or, for US4, the same `AdminTransactionController.php`).

---

## Parallel Example: Phase 2 Foundational

```bash
# After T001..T003 complete, the following can run in parallel:
Task T004: TransactionStatus enum
Task T005: Currency enum
Task T006: DepositParty enum
Task T007: AuditLogEntry value object
Task T008: ActorIdentity value object
Task T021: AuditLogEntryResource
Task T024: EmptyBodyRequest
Task T025: AdminGuard middleware

# After T004, T005, T007 complete:
Task T009: Transaction value object
Task T022: TransactionResource (depends on T009 too — sequence after T009)

# Test-writing tasks T018, T019, T020 can be authored in parallel
# after T013/T016/T017 land.
```

---

## Parallel Example: User Story 1

```bash
# Test files (write first, in parallel):
Task T028: CreateTransactionTest
Task T029: ListTransactionsTest
Task T030: ShowTransactionTest
Task T031: AutoMatchTest

# Then implementation:
Task T032: StoreTransactionRequest      # [P] with the controller edit only because they touch different files
Task T033..T036: TransactionController.store/index/show/autoMatch  # serial — same file
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (US1).
3. **STOP and VALIDATE**: Run `vendor/bin/pest --filter "Create|List|Show|AutoMatch"` from `backend/` and confirm all 4 feature tests pass. Run quickstart.md § 3a–3c against a live `php artisan serve`. The demo can already show the create-and-match journey.

### Incremental Delivery

1. Setup + Foundational → foundation ready (Checkpoint after Phase 2).
2. + US1 → matchable transfers (Checkpoint after Phase 3).
3. + US2 → completable transfers, 9/9 user-journey endpoints (Checkpoint after Phase 4).
4. + US3 → cancel + dispute (Checkpoint after Phase 5).
5. + US4 → admin oversight, 14/14 product endpoints (Checkpoint after Phase 6).
6. + Polish → ship-ready (Checkpoint after Phase 7).

Each step leaves the backend in a runnable state with all preceding stories' tests still passing (constitution Principle V: incremental delivery).

### Single-Implementer Strategy (recommended for cheap-LLM execution)

Run tasks strictly in numeric order (T001 → T070). The phase ordering is designed so that no task ever requires backtracking. The `[P]` markers exist for parallel team strategies and may be ignored by a single implementer.

---

## Notes

- Tasks reference exact file paths under `backend/`. Do not create files outside `backend/`, except for the `specs/005-core-api-implementation/` artefacts already present.
- The Phase 1 contract at `specs/002-api-discovery/api-contract.md` is the source of truth for endpoint shapes; the state-machine table at `specs/005-core-api-implementation/contracts/state-machine.md` is the source of truth for transitions; `specs/005-core-api-implementation/data-model.md` is the source of truth for domain class fields. When in doubt, read those three files — never invent contract behavior.
- Tests are AUTHORITATIVE per constitution Principle II. If a test fails, debug the implementation file referenced by the failing test — do NOT relax test assertions to match a non-conforming implementation.
- The `frontend/` directory MUST NOT be touched. Any task whose execution would modify a file under `frontend/` is incorrect and must be reconsidered.
- Each task's "Depends on" line lists the strict prerequisites. The phase ordering is designed so that following T001 → T070 sequentially never violates a dependency.
- After every group of tasks (typically per checkpoint), commit with a message that mentions the task IDs covered (e.g., `Phase 2 foundation: T004..T020`).
