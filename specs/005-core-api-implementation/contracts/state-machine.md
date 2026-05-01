# State Machine — Core API Implementation (Phase 4)

**Version**: v1.0.0
**Last-Updated**: 2026-04-30
**Status**: Plan-time contract (consumed by `/speckit-implement`)

This artefact is the Phase 4 contract deliverable: the authoritative
table of every legal transition in the transaction state machine.
Phase 1 documents per-endpoint `status_side_effects` row by row;
Phase 4's contribution is the cross-endpoint matrix that makes the
overall machine reviewable in one place. The Phase 4
implementation's `App\Domain\Transactions\TransactionStateMachine`
MUST read from this table; the unit tests in
`tests/Unit/Domain/Transactions/TransactionStateMachineTest.php`
MUST cover every row.

The states (`TxStatus` values) and the action verbs are taken
directly from `specs/002-api-discovery/api-contract.md` and from the
closed action set documented in
[../research.md](../research.md) § R-011.

## States (`TxStatus`)

```text
S1.  Pending Request
S2.  Match Found
S3.  Awaiting Deposits
S4.  Deposit Confirmed Partially
S5.  Both Deposits Confirmed
S6.  Processing Payouts
S7.  Completed                    (terminal)
S8.  Under Review
S9.  Failed                       (terminal)
S10. Refunded                     (terminal)
S11. Disputed
```

**Active states**: every state except S7, S9, S10 (the three terminal
states).

## Transitions

Each row describes one legal transition. The "Trigger" column is the
endpoint id from Phase 1 (or `<system>` for the lazy
`Processing Payouts → Completed` settlement). The "Allowed
predecessor" column is the exact set of source states from which the
trigger is legal; calling the trigger from any other state MUST
throw `InvalidStateException` and render the canonical
`409 invalid_state` envelope (data-model § ErrorEnvelope).

| # | Trigger | Endpoint | Allowed predecessor(s) | Result | Audit-log action | Side effects |
|---|---------|----------|-----------------------|--------|------------------|--------------|
| T01 | `<creation>` | `EP-003 POST /transactions` | (none — produces a new transaction) | S1 `Pending Request` | `request_created` | `id` issued (`TR-####`); `ownerId` = caller; `feePercent`/`exchangeRate`/`receivableAmount` set; `depositA=false`, `depositB=false`. |
| T02 | `autoMatch` | `EP-010 POST /transactions/{id}/auto-match` | S1 | S2 `Match Found` | `auto_matched` | none |
| T03 | `confirmMatch` | `EP-005 POST /transactions/{id}/confirm-match` | S2 | S3 `Awaiting Deposits` | `match_confirmed` | none |
| T04 | `confirmDeposit(party=A)` | `EP-006 POST /transactions/{id}/deposits` | S3 (with `depositA=false`), S4 (with `depositA=false`) | S4 `Deposit Confirmed Partially` if `depositB=false` after; S5 `Both Deposits Confirmed` if `depositB=true` after | `deposit_a_confirmed` | `depositA=true` |
| T05 | `confirmDeposit(party=B)` | `EP-006 POST /transactions/{id}/deposits` | S3 (with `depositB=false`), S4 (with `depositB=false`) | S4 `Deposit Confirmed Partially` if `depositA=false` after; S5 `Both Deposits Confirmed` if `depositA=true` after | `deposit_b_confirmed` | `depositB=true` |
| T06 | `processPayouts` | `EP-007 POST /transactions/{id}/process-payouts` | S5 | S6 `Processing Payouts` | `payouts_processing_started` | `processingPayoutsStartedAt = now` (non-wire) |
| T07 | `<system> settle` | (no endpoint — lazy on read) | S6, where `now - processingPayoutsStartedAt >= paymentWindowMinutes` | S7 `Completed` | `payouts_completed` | actor = `'system'`; runs inside `TransactionStore` reads via `SettlementClock` |
| T08 | `cancel` | `EP-004 POST /transactions/{id}/cancel` | S1, S2 | S9 `Failed` | `cancelled` | none |
| T09 | `openDispute` | `EP-008 POST /transactions/{id}/disputes` | every active state (S1, S2, S3, S4, S5, S6, S8) | S11 `Disputed` | `dispute_opened` | `disputeReason = request.reason` |
| T10 | `flagRisk` | `EP-011 POST /admin/transactions/{id}/flag-risk` | every active state (S1, S2, S3, S4, S5, S6, S11) | S8 `Under Review` | `flagged_for_review` | none |
| T11 | `approve` | `EP-012 POST /admin/transactions/{id}/approve` | S8 | S5 `Both Deposits Confirmed` | `admin_approved` | none |
| T12 | `refund` | `EP-013 POST /admin/transactions/{id}/refund` | every active state (S1, S2, S3, S4, S5, S6, S8, S11) | S10 `Refunded` | `admin_refunded` | none |
| T13 | `resolveDispute(outcome=Completed)` | `EP-014 POST /admin/transactions/{id}/resolve-dispute` | S11 | S7 `Completed` | `dispute_resolved_completed` | none |
| T14 | `resolveDispute(outcome=Refunded)` | `EP-014 POST /admin/transactions/{id}/resolve-dispute` | S11 | S10 `Refunded` | `dispute_resolved_refunded` | none |

**Row count**: 14. Every state-changing endpoint in Phase 4's scope
appears at least once; the lazy `Processing Payouts → Completed`
settlement (T07) is the only non-endpoint trigger.

## Out-of-scope (terminal-state) calls

Calls to ANY trigger row T02..T14 against a terminal state (S7
`Completed`, S9 `Failed`, S10 `Refunded`) MUST be rejected with
`InvalidStateException` and render the canonical
`409 invalid_state` envelope. The state-machine class MUST treat
"current state is terminal" as a single uniform reject path before
running the action-specific predecessor check, so the test surface
for terminal-state rejects is one table per terminal state rather
than one assertion per (terminal × trigger) pair.

## Cancel vs. dispute on `Awaiting Deposits` and later

Note that `cancel` (T08) is intentionally restricted to S1 and S2
only. Once a transaction has reached `Awaiting Deposits` (S3),
"backing out" is an operational matter handled by `openDispute`
(T09) or by an admin action (T10/T12), not by self-cancel. This
matches the Phase 1 derivation from
`frontend/src/context/DemoContext.tsx:171-184`'s `cancelTransaction`,
which the frontend invokes from `AwaitingDepositPage` against
transactions that are still pre-deposit.

## Self-redundant calls

- Calling `confirmDeposit(party=A)` against a transaction whose
  `depositA` is already `true` MUST be rejected with
  `InvalidStateException` (the row T04 predecessor includes the
  `depositA=false` guard). The mirror rule applies for `party=B`.
  This makes the second call idempotent-by-rejection rather than
  silently flipping flags or no-op-passing.

## Endpoint → trigger map

| Endpoint | Trigger | Source-state restriction |
|----------|---------|--------------------------|
| `EP-001 GET /transactions` | (read) | none — returns owner's transactions; runs lazy settlement on each row |
| `EP-002 GET /transactions/{id}` | (read) | none — returns the transaction; runs lazy settlement on the row |
| `EP-003 POST /transactions` | T01 | none — creates a new transaction |
| `EP-004 POST /transactions/{id}/cancel` | T08 | S1, S2 |
| `EP-005 POST /transactions/{id}/confirm-match` | T03 | S2 |
| `EP-006 POST /transactions/{id}/deposits` | T04 / T05 | S3 or S4 with the matching deposit flag still `false` |
| `EP-007 POST /transactions/{id}/process-payouts` | T06 | S5 |
| `EP-008 POST /transactions/{id}/disputes` | T09 | active states |
| `EP-009 GET /admin/transactions` | (read) | none — admin-only; returns all transactions |
| `EP-010 POST /transactions/{id}/auto-match` | T02 | S1 |
| `EP-011 POST /admin/transactions/{id}/flag-risk` | T10 | active states |
| `EP-012 POST /admin/transactions/{id}/approve` | T11 | S8 |
| `EP-013 POST /admin/transactions/{id}/refund` | T12 | active states |
| `EP-014 POST /admin/transactions/{id}/resolve-dispute` | T13 / T14 | S11 |

## Visualization

```text
                  ┌──────────────────┐
                  │      <create>    │ T01 EP-003
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  S1 Pending Req  │
                  └────────┬─────────┘
                           │ T02 EP-010 auto-match
                           ▼
                  ┌──────────────────┐         T08 EP-004 cancel
                  │  S2 Match Found  │ ──────────────────────┐
                  └────────┬─────────┘                       │
                           │ T03 EP-005 confirm-match        │
                           ▼                                 │
                  ┌──────────────────┐                       │
                  │ S3 Awaiting Dep. │                       │
                  └────────┬─────────┘                       │
                           │ T04/T05 EP-006 (one party)      │
                           ▼                                 │
                  ┌──────────────────┐                       │
                  │ S4 Deposit P.    │                       │
                  └────────┬─────────┘                       │
                           │ T04/T05 EP-006 (other party)    │
                           ▼                                 │
                  ┌──────────────────┐                       │
                  │ S5 Both Dep. Cnf.│                       │
                  └────────┬─────────┘                       │
                           │ T06 EP-007 process-payouts      │
                           ▼                                 │
                  ┌──────────────────┐                       │
                  │ S6 Processing P. │                       │
                  └────────┬─────────┘                       │
                           │ T07 <system> after window       │
                           ▼                                 │
                  ┌──────────────────┐                       │
                  │ S7 Completed     │ TERMINAL              │
                  └──────────────────┘                       │
                                                             ▼
                                                     ┌──────────────────┐
                                                     │ S9 Failed        │ TERMINAL
                                                     └──────────────────┘

  T09 EP-008 disputes (from active) ──► S11 Disputed
  T10 EP-011 flag-risk (from active) ──► S8 Under Review
  T11 EP-012 approve  (from S8)      ──► S5
  T12 EP-013 refund   (from active)  ──► S10 Refunded TERMINAL
  T13 EP-014 resolve-dispute Completed (from S11) ──► S7 TERMINAL
  T14 EP-014 resolve-dispute Refunded  (from S11) ──► S10 TERMINAL
```

## Verification

The Phase 4 implementation passes this contract iff:

1. The unit-test file
   `backend/tests/Unit/Domain/Transactions/TransactionStateMachineTest.php`
   contains at least one test for each of T01..T14 covering both the
   legal-source case (transition succeeds) and the
   illegal-source case (`InvalidStateException` is thrown). For the
   transitions that depend on a deposit flag (T04, T05), both flag
   states for the *other* deposit are covered.
2. Phase 3's contract suite, run after Phase 4 lands, classifies the
   14 user-journey + admin-journey endpoints as passing and emits no
   unexpected contract failures.
3. A reviewer can manually walk this table against the
   `TransactionStateMachine` source and confirm every method's
   predecessor check matches the row's "Allowed predecessor(s)"
   column.

## Changelog

### v1.0.0 (2026-04-30) — Plan-time skeleton

- Recorded all 14 transitions (T01..T14) plus the lazy settlement
  trigger (T07) with their allowed predecessors, audit-log action
  verbs, and side effects.
- Locked the closed action set per research R-011.
- Locked the cancel-only-from-S1/S2 derivation per Phase 1
  `frontend/src/context/DemoContext.tsx:171-184`.
- Locked the deposit-flag idempotent-by-rejection rule per spec
  Edge Cases.
