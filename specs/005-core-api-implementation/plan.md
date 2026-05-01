# Implementation Plan: Core API Implementation (Phase 4)

**Branch**: `005-core-api-implementation` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-core-api-implementation/spec.md`

## Summary

Phase 4 turns the 14 user-journey and admin-journey stubs left behind
by Phase 2 (`EP-001`..`EP-014` excluding the auth endpoints) into
working endpoints. Every endpoint preserves its Phase 1 path, method,
request shape, response shape, status codes, and error envelope
verbatim. The 4 auth endpoints (`EP-015`..`EP-018`) remain Phase 2
stubs (HTTP 501 + `not_implemented` envelope) because Phase 1's
`CR-002` records `phase_6` as their owner; Phase 4 does not touch them.

The implementation is layered Laravel-idiomatically:

- **Routing** — unchanged from Phase 2's `routes/api.php` (the route
  registry diff is empty for path/method).
- **Validation** — one `FormRequest` per state-changing endpoint,
  bridged to the canonical `validation_failed` envelope by Phase 2's
  central exception handler.
- **Response shaping** — one `TransactionResource` and one
  `TransactionCollection` so every endpoint returning a transaction
  emits the exact Phase 1 shape from one place.
- **State** — a process-local singleton `TransactionStore` keyed by
  transaction id, plus a `TransactionStateMachine` that owns every
  legal transition and rejects illegal ones with the canonical
  `invalid_state` envelope. Storage is in-memory (allowed by the
  constitution's Technology Stack section until Phase 5).
- **Settlement timing** — `EP-007` returns `Processing Payouts`
  immediately and lazily transitions the transaction to `Completed`
  on the next read of `EP-001` or `EP-002` once
  `paymentWindowMinutes` has elapsed. No queue worker, no scheduler.
- **Identity** — Phase 2's `BearerPresenceAuth` middleware stays in
  force; the bearer token's SHA-256 prefix becomes the stable user
  identifier for ownership checks. A new `AdminGuard` middleware
  rejects non-admin tokens (admin tokens are read from a config-driven
  allowlist) on the 5 admin endpoints.

The plan introduces no new constitution-level deviations. The two
deviations recorded in Phase 2's plan (Laravel route prefix
reconfiguration; Phase 3 dispensation for derived endpoints) remain in
force and apply unchanged.

The Phase 4 exit gate is the Phase 3 contract suite running in its
default foundation mode and reporting exactly 14 passing endpoint
groups (the 9 user-journey + 5 admin-journey endpoints) and exactly
4 expected-stub-failure groups (`EP-015`..`EP-018`), with 0
unexpected-failure and 0 environment-failure rows (spec SC-003,
SC-009).

## Technical Context

**Language/Version**: PHP 8.3.x — pinned in `backend/composer.json`
`require.php: "^8.3"` from Phase 2; unchanged.

**Primary Dependencies**: Laravel 11.x — pinned in
`backend/composer.json` `require.laravel/framework: "^11.0"` from
Phase 2; unchanged. No new runtime dependencies are introduced by
Phase 4. Phase 4 leverages Laravel built-ins only: `FormRequest`
validation, `JsonResource` / `ResourceCollection` response shaping,
the container's `singleton()` binding, and the central exception
handler registered in `bootstrap/app.php`.

**Storage**: In-memory, process-local. A singleton
`App\Domain\Transactions\TransactionStore` holds an
`array<string, Transaction>` keyed by transaction id and survives
across requests in the same `php artisan serve` process. Restarts
reset the store; spec FR-025 documents this as acceptable Phase 4
behavior. Phase 5 will replace the store with Eloquent + migrations
without changing the observable contract.

**Testing**: Pest 3.x — pinned in `backend/composer.json`
`require-dev.pestphp/pest: "^3.0"` from Phase 2; unchanged. Phase 4
adds:

- One feature test file per state-changing endpoint group (transactions
  and admin-transactions) covering happy paths, ownership
  enforcement, and invalid-state rejection.
- One state-machine unit test in `tests/Unit/Domain/Transactions/`
  covering every legal and illegal transition independent of HTTP.
- One settlement-window unit test asserting the lazy
  `Processing Payouts → Completed` transition only fires after
  `paymentWindowMinutes` have elapsed.

Phase 3's contract suite is the integration gate; Phase 4 must not
touch contract assertions, only flip stub failures into passes
(constitution Principle II; spec FR-028, FR-031).

**Target Platform**: Linux/macOS server with PHP 8.3+, served by
`php artisan serve` for local development; production deployment is
Phase 7's concern. Unchanged from Phase 2.

**Project Type**: Web service backend, alongside the existing React
frontend in `frontend/`. Backend lives under the existing top-level
`backend/` directory created in Phase 2; no second app is introduced.

**Performance Goals**:

- Demo-path endpoints (create, auto-match, confirm-match,
  confirm-deposit, process-payouts) respond in under 200 ms p95 on a
  developer laptop with an empty in-memory store (spec SC-010).
- Read endpoints (`EP-001`, `EP-002`, `EP-009`) respond in under 100
  ms p95 on the same baseline, since they are pure reads against the
  in-memory store.
- Health endpoint cold-start performance unchanged from Phase 2
  (under 200 ms; carried forward by spec FR-033).

**Constraints**:

- MUST NOT modify any file under `frontend/` (constitution Principle I;
  spec FR-026).
- MUST NOT add or rename any route in `routes/api.php` — the Phase 2
  route registry is the contract surface and the diff between Phase 2
  and Phase 4 must be empty for path/method (spec SC-004).
- MUST NOT touch the auth endpoints (`EP-015`..`EP-018`); they remain
  Phase 2 stubs (spec FR-003).
- MUST NOT introduce a database, migration, or Eloquent model;
  persistence is Phase 5's surface (spec FR-024).
- MUST NOT touch the central exception handler's envelope shape; only
  add new exception → envelope mappings for `InvalidStateException`,
  `ForbiddenAccessException`, and `OwnershipDeniedException` defined
  in this phase.
- MUST NOT issue tokens, validate token contents, or look up users
  in a credentials store; identity remains presence-of-credential per
  Phase 2 (spec FR-023).

**Scale/Scope**:

- 14 endpoints implemented (`EP-001`..`EP-014` excluding `EP-015`..
  `EP-018`).
- 11 of those are state-changing; 3 are reads (`EP-001`, `EP-002`,
  `EP-009`).
- ~6 `FormRequest` classes (one per endpoint with a non-empty body):
  `StoreTransactionRequest`, `ConfirmDepositRequest`,
  `OpenDisputeRequest`, `ResolveDisputeRequest`, plus list-filter
  requests for `IndexAdminTransactionsRequest`. Empty-body endpoints
  (cancel, confirm-match, process-payouts, auto-match, flag-risk,
  approve, refund) reuse a shared `EmptyBodyRequest` to assert
  Content-Type discipline only.
- 2 API Resources: `TransactionResource`, `TransactionCollection`.
- 3 domain classes: `TransactionStore`, `TransactionStateMachine`,
  `TransactionFactory`.
- 1 new middleware: `AdminGuard`.
- 3 new exception types: `InvalidStateException`,
  `ForbiddenAccessException`, `OwnershipDeniedException` (the latter
  renders as the canonical `forbidden` envelope per spec FR-020).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution at `.specify/memory/constitution.md` v1.0.1 defines
five principles. Applied to Phase 4:

| # | Principle | Applicability | Status |
|---|-----------|---------------|--------|
| I | Frontend-Contract Fidelity (NON-NEGOTIABLE) | Direct — every Phase 4 endpoint preserves its Phase 1 path, method, request shape, response shape, and status codes verbatim. The route registry diff against Phase 2 is empty for path/method. No `frontend/` edits (spec FR-026). | ✅ Pass |
| II | Test-First Development (NON-NEGOTIABLE) | Direct — Phase 4 work is gated by Phase 3's already-failing contract tests, which constitute the executable contract. Phase 4 also adds feature/unit tests for ownership, state machine, and settlement timing; per spec FR-030 those tests are authored before the implementation they exercise. | ✅ Pass |
| III | Contract Tests Derived From Observed Frontend Behavior | Indirect — Phase 4 does not write contract tests; it makes Phase 3's contract tests pass. The Phase 2 / Phase 3 dispensation for derived endpoints continues unchanged (spec FR-006). No new contradictions introduced. | ✅ Pass (under existing dispensation) |
| IV | Laravel Idiomatic Architecture | Direct — Phase 4 is built entirely on idiomatic Laravel: `FormRequest` per endpoint, `JsonResource`/`ResourceCollection` response shaping, central exception handler for the envelope, thin controllers with services and a state-machine domain class behind them, route middleware for admin authorization. No raw SQL. No deviation introduced. | ✅ Pass |
| V | Spec-Driven Phased Delivery | Direct — this feature *is* the Phase 4 cycle. Phase 5 starts only after Phase 4's exit criteria pass. Persistence is explicitly out of scope (spec FR-024) and reserved for Phase 5. | ✅ Pass |

**Initial gate**: PASS with no new deviations beyond the two already
recorded in Phase 2's plan (Laravel route prefix reconfiguration;
Phase 3 dispensation for derived endpoints), both of which continue
to apply unchanged.

**Post-design re-check**: see end of Phase 1 below.

## Project Structure

### Documentation (this feature)

```text
specs/005-core-api-implementation/
├── spec.md                     # Specification (no [NEEDS CLARIFICATION])
├── plan.md                     # This file (/speckit-plan)
├── research.md                 # Phase 0 output (/speckit-plan)
├── data-model.md               # Phase 1 output (/speckit-plan)
├── quickstart.md               # Phase 1 output (/speckit-plan)
├── checklists/
│   └── requirements.md         # Spec quality checklist (already passing)
├── contracts/
│   └── state-machine.md        # Authoritative state-transition table for Phase 4
└── tasks.md                    # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
backend/                                         # EXISTING — created in Phase 2
├── app/
│   ├── Domain/                                  # NEW — Phase 4 domain layer
│   │   ├── Transactions/
│   │   │   ├── Transaction.php                  # NEW — POPO mirroring Phase 1 entity
│   │   │   ├── TransactionStatus.php            # NEW — string-backed enum from Phase 1 TxStatus
│   │   │   ├── Currency.php                     # NEW — string-backed enum (USD|EGP|ILS)
│   │   │   ├── TransactionStore.php             # NEW — singleton in-memory store
│   │   │   ├── TransactionStateMachine.php      # NEW — owns every legal transition
│   │   │   ├── TransactionFactory.php           # NEW — server-issued id + initial state
│   │   │   ├── SettlementClock.php              # NEW — wraps `now()` for testability
│   │   │   └── DepositParty.php                 # NEW — string-backed enum (A|B)
│   │   ├── Audit/
│   │   │   └── AuditLogEntry.php                # NEW — immutable value object
│   │   └── Users/
│   │       └── ActorIdentity.php                # NEW — derives id and admin flag from token
│   ├── Exceptions/
│   │   ├── EnvelopeRenderer.php                 # EXISTING — extended to map new exceptions
│   │   ├── InvalidStateException.php            # NEW — renders 409 invalid_state
│   │   ├── ForbiddenAccessException.php         # NEW — renders 403 forbidden (admin)
│   │   └── OwnershipDeniedException.php         # NEW — renders 403 forbidden (ownership)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── HealthController.php             # EXISTING — unchanged
│   │   │   ├── TransactionController.php        # EXISTING — bodies replaced by Phase 4
│   │   │   ├── AdminTransactionController.php   # EXISTING — bodies replaced by Phase 4
│   │   │   └── AuthController.php               # EXISTING — UNCHANGED (Phase 6 owns)
│   │   ├── Middleware/
│   │   │   ├── BearerPresenceAuth.php           # EXISTING — unchanged
│   │   │   ├── StrictCorsOrigin.php             # EXISTING — unchanged
│   │   │   ├── StructuredRequestLog.php         # EXISTING — unchanged
│   │   │   └── AdminGuard.php                   # NEW — rejects non-admin tokens with 403
│   │   ├── Requests/                            # NEW directory
│   │   │   ├── StoreTransactionRequest.php      # EP-003
│   │   │   ├── ConfirmDepositRequest.php        # EP-006
│   │   │   ├── OpenDisputeRequest.php           # EP-008
│   │   │   ├── ResolveDisputeRequest.php        # EP-014
│   │   │   ├── IndexAdminTransactionsRequest.php# EP-009 query filter
│   │   │   └── EmptyBodyRequest.php             # shared for cancel/confirm-match/etc.
│   │   └── Resources/                           # NEW directory
│   │       ├── TransactionResource.php          # one-place response shaping
│   │       └── TransactionCollection.php        # `{ "transactions": [...] }`
│   ├── Providers/
│   │   └── DomainServiceProvider.php            # NEW — singleton bindings for the domain layer
│   └── Support/
│       └── ErrorEnvelope.php                    # EXISTING — extended with `invalidState`, `forbidden`
├── bootstrap/
│   └── app.php                                  # EXISTING — register AdminGuard middleware alias
├── config/
│   └── salamhack.php                            # NEW — DemoConfig values + admin token allowlist
├── routes/
│   └── api.php                                  # EXISTING — extended only to apply AdminGuard to admin routes
├── tests/
│   ├── Feature/
│   │   ├── FoundationSmokeTest.php              # EXISTING — unchanged
│   │   ├── Transactions/
│   │   │   ├── CreateTransactionTest.php        # NEW — EP-003 happy + validation paths
│   │   │   ├── ListTransactionsTest.php         # NEW — EP-001 ownership scoping
│   │   │   ├── ShowTransactionTest.php          # NEW — EP-002 + ownership 403
│   │   │   ├── AutoMatchTest.php                # NEW — EP-010
│   │   │   ├── ConfirmMatchTest.php             # NEW — EP-005
│   │   │   ├── ConfirmDepositTest.php           # NEW — EP-006
│   │   │   ├── ProcessPayoutsTest.php           # NEW — EP-007 + lazy settlement
│   │   │   ├── CancelTransactionTest.php        # NEW — EP-004
│   │   │   └── OpenDisputeTest.php              # NEW — EP-008
│   │   └── Admin/
│   │       ├── ListAdminTransactionsTest.php    # NEW — EP-009 + status filter + admin guard
│   │       ├── FlagRiskTest.php                 # NEW — EP-011
│   │       ├── ApproveTransactionTest.php       # NEW — EP-012
│   │       ├── RefundTransactionTest.php        # NEW — EP-013
│   │       └── ResolveDisputeTest.php           # NEW — EP-014
│   └── Unit/
│       └── Domain/
│           └── Transactions/
│               ├── TransactionStateMachineTest.php # NEW — every legal + illegal transition
│               ├── TransactionFactoryTest.php      # NEW — id format + initial fields
│               └── SettlementClockTest.php         # NEW — settlement window timing
├── composer.json                                # EXISTING — no new dependencies
├── .env.example                                 # EXTENDED — adds SALAMHACK_ADMIN_TOKENS, SALAMHACK_PAYMENT_WINDOW_MINUTES
└── README.md                                    # EXISTING — pointer updated by quickstart task

frontend/                                        # UNCHANGED — Principle I
└── (no edits)

CLAUDE.md                                        # EDITED — pointer updated to this plan
```

**Structure Decision**: Phase 4 lives entirely inside the existing
`backend/` Laravel app created in Phase 2; no new top-level
directories are introduced. The new code clusters into three thin
layers stacked on the existing controller/middleware skeleton:

1. **Validation layer** — `app/Http/Requests/`. One `FormRequest`
   per endpoint with a non-empty body (per constitution Principle IV).
2. **Domain layer** — `app/Domain/Transactions/`. The state machine,
   in-memory store, factory, and settlement clock. This layer is pure
   PHP; it has no HTTP knowledge and is unit-testable independent of
   Laravel. It is registered with the Laravel container in a new
   `App\Providers\DomainServiceProvider`.
3. **Response layer** — `app/Http/Resources/`. One Resource defines
   the entire `Transaction` JSON shape so every endpoint that returns
   a transaction emits it in exactly one place (per constitution
   Principle IV; spec FR-004).

Controllers stay thin: they parse a `FormRequest`, hand the call to
the domain layer (via the container's resolved singleton), and wrap
the result in a Resource. Errors propagate as exceptions and the
central exception handler renders the canonical envelope.

## Complexity Tracking

> No new deviations introduced by Phase 4. The two deviations recorded
> in Phase 2's `plan.md` (route prefix reconfiguration; Phase 3
> dispensation for derived endpoints) remain in force and continue to
> apply unchanged.

The constitution's Technology Stack section explicitly permits
in-memory storage in phases prior to Phase 5
(`.specify/memory/constitution.md` § Technology Stack & Constraints,
"Storage" bullet); the singleton `TransactionStore` is therefore
**not** a deviation.

---

## Phase 0: Outline & Research

**Status**: Complete — spec contains 0 `[NEEDS CLARIFICATION]`
markers. The four implementation choices the spec deferred to the
plan via its Assumptions section (auto-match semantics,
process-payouts settlement timing, admin identity source, in-memory
storage shape) are resolved in [research.md](./research.md) along with
ownership-derivation, state-machine encoding, and Resource shaping
decisions.

Output: [research.md](./research.md). It records the plan-time
decisions that shape Phase 4's deliverable, the rationale for each,
and alternatives considered.

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete (yes).

1. **Entities → data-model.md**: Phase 4 advances the Phase 1
   entities through their state machine and adds three small
   plan-private value objects (`ActorIdentity`,
   `AuditLogEntry`-as-PHP-class, `SettlementClock`) that have no
   wire shape but are part of the implementation surface. The
   data-model document captures attribute lists, validation rules
   derived from the FR-### requirements, and the explicit state
   transition table. See [data-model.md](./data-model.md).

2. **Interface contracts → contracts/**: PRESENT. Phase 4's contract
   contribution is the **state machine** that owns every legal
   transition between transaction statuses. The Phase 1 contract
   already documents the per-endpoint
   `status_codes`/`status_side_effects`; Phase 4 adds an explicit,
   reviewable cross-endpoint table at
   [contracts/state-machine.md](./contracts/state-machine.md).
   `/speckit-implement` cross-checks the table against the
   `TransactionStateMachine` source so a reviewer can confirm one
   reads from the other.

3. **Quickstart → quickstart.md**: A reviewer-oriented walkthrough
   covering: prerequisites (Phase 2 setup completed; PHP 8.3+,
   Composer 2.x), running Phase 4's feature tests
   (`vendor/bin/pest --filter Transactions`), exercising the demo
   user journey end-to-end with `curl` (create → auto-match →
   confirm-match → confirm-deposit ×2 → process-payouts →
   poll-until-Completed), and running the Phase 3 contract suite to
   verify the 14/4 pass/stub split. See
   [quickstart.md](./quickstart.md).

4. **Agent context update**: The plan reference in `CLAUDE.md`
   between the `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->`
   markers is updated to point at this plan
   (`specs/005-core-api-implementation/plan.md`). The
   constitution-precedence note remains intact.

**Output**: research.md, data-model.md, contracts/state-machine.md,
quickstart.md, updated `CLAUDE.md` plan pointer.

### Constitution Check (post-design re-evaluation)

After Phase 1 design, no new violations introduced beyond the two
already in force from Phase 2's plan:

- Principle I: every endpoint preserves its Phase 1 path, method,
  request shape, response shape, and status codes; route registry
  diff is empty. ✅
- Principle II: feature/unit tests for new behavior are authored
  before the implementation per spec FR-030; Phase 3's already-failing
  contract tests are the executable contract that gates merge. ✅
- Principle III: Phase 4 changes no contract assertions; the Phase
  2/3 dispensation continues unchanged. ✅
- Principle IV: design uses idiomatic Laravel layering exclusively
  (`FormRequest`, `JsonResource`, container singletons, central
  exception handler, route middleware). No new deviation. ✅
- Principle V: design fits within Phase 4's envelope — no
  persistence (Phase 5), no token issuance or credential validation
  (Phase 6), no production hardening (Phase 7). ✅

**Post-design gate**: PASS with no new deviations.
