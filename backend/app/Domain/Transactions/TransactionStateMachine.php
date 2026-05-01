<?php

namespace App\Domain\Transactions;

use App\Domain\Audit\AuditLogEntry;
use App\Domain\Users\ActorIdentity;
use App\Exceptions\InvalidStateException;
use Carbon\CarbonImmutable;
use InvalidArgumentException;

final class TransactionStateMachine
{
    public function autoMatch(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [TransactionStatus::PendingRequest], 'EP-010', 'autoMatch');

        return $this->transition($tx, $actor, $now, TransactionStatus::MatchFound, 'auto_matched');
    }

    public function confirmMatch(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [TransactionStatus::MatchFound], 'EP-005', 'confirmMatch');

        return $this->transition($tx, $actor, $now, TransactionStatus::AwaitingDeposits, 'match_confirmed');
    }

    public function confirmDeposit(Transaction $tx, DepositParty $party, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [TransactionStatus::AwaitingDeposits, TransactionStatus::DepositConfirmedPartially], 'EP-006', 'confirmDeposit');

        if (($party === DepositParty::A && $tx->depositA) || ($party === DepositParty::B && $tx->depositB)) {
            throw new InvalidStateException('EP-006', $tx->status->value, 'confirmDeposit');
        }

        $depositA = $tx->depositA || $party === DepositParty::A;
        $depositB = $tx->depositB || $party === DepositParty::B;

        return $this->transition(
            $tx,
            $actor,
            $now,
            $depositA && $depositB ? TransactionStatus::BothDepositsConfirmed : TransactionStatus::DepositConfirmedPartially,
            $party === DepositParty::A ? 'deposit_a_confirmed' : 'deposit_b_confirmed',
            ['depositA' => $depositA, 'depositB' => $depositB],
        );
    }

    public function processPayouts(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [TransactionStatus::BothDepositsConfirmed], 'EP-007', 'processPayouts');

        return $this->transition($tx, $actor, $now, TransactionStatus::ProcessingPayouts, 'payouts_processing_started', [
            'processingPayoutsStartedAt' => $now,
        ]);
    }

    public function cancel(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [TransactionStatus::PendingRequest, TransactionStatus::MatchFound], 'EP-004', 'cancel');

        return $this->transition($tx, $actor, $now, TransactionStatus::Failed, 'cancelled');
    }

    public function openDispute(Transaction $tx, string $reason, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [
            TransactionStatus::PendingRequest,
            TransactionStatus::MatchFound,
            TransactionStatus::AwaitingDeposits,
            TransactionStatus::DepositConfirmedPartially,
            TransactionStatus::BothDepositsConfirmed,
            TransactionStatus::ProcessingPayouts,
            TransactionStatus::UnderReview,
        ], 'EP-008', 'openDispute');

        return $this->transition($tx, $actor, $now, TransactionStatus::Disputed, 'dispute_opened', [
            'disputeReason' => $reason,
        ]);
    }

    public function flagRisk(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [
            TransactionStatus::PendingRequest,
            TransactionStatus::MatchFound,
            TransactionStatus::AwaitingDeposits,
            TransactionStatus::DepositConfirmedPartially,
            TransactionStatus::BothDepositsConfirmed,
            TransactionStatus::ProcessingPayouts,
            TransactionStatus::Disputed,
        ], 'EP-011', 'flagRisk');

        return $this->transition($tx, $actor, $now, TransactionStatus::UnderReview, 'flagged_for_review');
    }

    public function approve(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [TransactionStatus::UnderReview], 'EP-012', 'approve');

        return $this->transition($tx, $actor, $now, TransactionStatus::BothDepositsConfirmed, 'admin_approved');
    }

    public function refund(Transaction $tx, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [
            TransactionStatus::PendingRequest,
            TransactionStatus::MatchFound,
            TransactionStatus::AwaitingDeposits,
            TransactionStatus::DepositConfirmedPartially,
            TransactionStatus::BothDepositsConfirmed,
            TransactionStatus::ProcessingPayouts,
            TransactionStatus::UnderReview,
            TransactionStatus::Disputed,
        ], 'EP-013', 'refund');

        return $this->transition($tx, $actor, $now, TransactionStatus::Refunded, 'admin_refunded');
    }

    public function resolveDispute(Transaction $tx, string $outcome, ActorIdentity $actor, CarbonImmutable $now): Transaction
    {
        $this->assertAllowed($tx, [TransactionStatus::Disputed], 'EP-014', 'resolveDispute');

        return match ($outcome) {
            'Completed' => $this->transition($tx, $actor, $now, TransactionStatus::Completed, 'dispute_resolved_completed'),
            'Refunded' => $this->transition($tx, $actor, $now, TransactionStatus::Refunded, 'dispute_resolved_refunded'),
            default => throw new InvalidArgumentException("Unsupported dispute outcome {$outcome}."),
        };
    }

    /**
     * @param  list<TransactionStatus>  $allowed
     */
    private function assertAllowed(Transaction $tx, array $allowed, string $endpointId, string $action): void
    {
        if ($tx->status->isTerminal() || ! in_array($tx->status, $allowed, true)) {
            throw new InvalidStateException($endpointId, $tx->status->value, $action);
        }
    }

    /**
     * @param  array<string, mixed>  $changes
     */
    private function transition(
        Transaction $tx,
        ActorIdentity $actor,
        CarbonImmutable $now,
        TransactionStatus $status,
        string $action,
        array $changes = [],
    ): Transaction {
        return $tx->with([
            ...$changes,
            'status' => $status,
            'auditLog' => [
                ...$tx->auditLog,
                new AuditLogEntry($now, $actor->id, $action),
            ],
        ]);
    }
}
