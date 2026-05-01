<?php

use App\Domain\Audit\AuditLogEntry;
use App\Domain\Transactions\Currency;
use App\Domain\Transactions\DepositParty;
use App\Domain\Transactions\Transaction;
use App\Domain\Transactions\TransactionStateMachine;
use App\Domain\Transactions\TransactionStatus;
use App\Domain\Users\ActorIdentity;
use App\Exceptions\InvalidStateException;
use Carbon\CarbonImmutable;

function stateMachineTestTx(TransactionStatus $status, bool $depositA = false, bool $depositB = false): Transaction
{
    $now = CarbonImmutable::parse('2026-04-30T12:00:00Z');

    return new Transaction('TR-0001', 'Gaza', 'Egypt', 100, Currency::USD, $status, 2, 1, 98, $now, $depositA, $depositB, null, 'usr-owner', null, [
        new AuditLogEntry($now, 'usr-owner', 'seeded'),
    ]);
}

function stateMachineActor(): ActorIdentity
{
    return new ActorIdentity('usr-test1234', false);
}

function stateMachineNow(): CarbonImmutable
{
    return CarbonImmutable::parse('2026-04-30T12:00:00Z');
}

it('performs core user journey transitions', function (): void {
    $machine = new TransactionStateMachine;
    $actor = stateMachineActor();
    $now = stateMachineNow();

    $tx = $machine->autoMatch(stateMachineTestTx(TransactionStatus::PendingRequest), $actor, $now);
    expect($tx->status)->toBe(TransactionStatus::MatchFound)
        ->and($tx->auditLog[1]->action)->toBe('auto_matched');

    $tx = $machine->confirmMatch($tx, $actor, $now);
    expect($tx->status)->toBe(TransactionStatus::AwaitingDeposits)
        ->and($tx->auditLog[2]->action)->toBe('match_confirmed');

    $tx = $machine->confirmDeposit($tx, DepositParty::A, $actor, $now);
    expect($tx->status)->toBe(TransactionStatus::DepositConfirmedPartially)
        ->and($tx->depositA)->toBeTrue()
        ->and($tx->auditLog[3]->action)->toBe('deposit_a_confirmed');

    $tx = $machine->confirmDeposit($tx, DepositParty::B, $actor, $now);
    expect($tx->status)->toBe(TransactionStatus::BothDepositsConfirmed)
        ->and($tx->depositB)->toBeTrue()
        ->and($tx->auditLog[4]->action)->toBe('deposit_b_confirmed');

    $tx = $machine->processPayouts($tx, $actor, $now);
    expect($tx->status)->toBe(TransactionStatus::ProcessingPayouts)
        ->and($tx->processingPayoutsStartedAt)->toEqual($now)
        ->and($tx->auditLog[5]->action)->toBe('payouts_processing_started');
});

it('performs cancel dispute and admin transitions', function (): void {
    $machine = new TransactionStateMachine;
    $actor = new ActorIdentity('usr-admin', true);
    $now = stateMachineNow();

    expect($machine->cancel(stateMachineTestTx(TransactionStatus::PendingRequest), $actor, $now)->status)->toBe(TransactionStatus::Failed);

    $disputed = $machine->openDispute(stateMachineTestTx(TransactionStatus::AwaitingDeposits), 'reason', $actor, $now);
    expect($disputed->status)->toBe(TransactionStatus::Disputed)
        ->and($disputed->disputeReason)->toBe('reason');

    $underReview = $machine->flagRisk(stateMachineTestTx(TransactionStatus::BothDepositsConfirmed, true, true), $actor, $now);
    expect($underReview->status)->toBe(TransactionStatus::UnderReview)
        ->and($machine->approve($underReview, $actor, $now)->status)->toBe(TransactionStatus::BothDepositsConfirmed)
        ->and($machine->refund($underReview, $actor, $now)->status)->toBe(TransactionStatus::Refunded)
        ->and($machine->resolveDispute($disputed, 'Completed', $actor, $now)->status)->toBe(TransactionStatus::Completed)
        ->and($machine->resolveDispute($disputed, 'Refunded', $actor, $now)->status)->toBe(TransactionStatus::Refunded);
});

it('rejects illegal and terminal transitions', function (): void {
    $machine = new TransactionStateMachine;
    $actor = stateMachineActor();
    $now = stateMachineNow();

    expect(fn () => $machine->autoMatch(stateMachineTestTx(TransactionStatus::MatchFound), $actor, $now))->toThrow(InvalidStateException::class)
        ->and(fn () => $machine->confirmDeposit(stateMachineTestTx(TransactionStatus::AwaitingDeposits, true, false), DepositParty::A, $actor, $now))->toThrow(InvalidStateException::class)
        ->and(fn () => $machine->cancel(stateMachineTestTx(TransactionStatus::Completed), $actor, $now))->toThrow(InvalidStateException::class)
        ->and(fn () => $machine->refund(stateMachineTestTx(TransactionStatus::Refunded), $actor, $now))->toThrow(InvalidStateException::class);
});
