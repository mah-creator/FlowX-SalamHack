<?php

namespace App\Domain\Transactions;

use App\Domain\Audit\AuditLogEntry;
use App\Domain\FlowX\FlowXTransferStatus;
use App\Models\FlowXTransfer;
use Carbon\CarbonImmutable;

final class FlowXTransactionCompatibilityMapper
{
    public function fromFlowX(FlowXTransfer $transfer): Transaction
    {
        return new Transaction(
            id: (string) $transfer->id,
            source: (string) $transfer->source_country,
            destination: (string) $transfer->destination_country,
            amount: (float) $transfer->amount,
            currency: Currency::from((string) $transfer->currency),
            status: $this->toLegacyStatus((string) $transfer->status),
            feePercent: (float) config('salamhack.demo_config.fee_percent', 2),
            exchangeRate: (float) $transfer->exchange_rate,
            receivableAmount: (float) $transfer->net_amount,
            createdAt: CarbonImmutable::parse((string) $transfer->created_at_value),
            depositA: in_array((string) $transfer->status, [
                FlowXTransferStatus::DEPOSIT_CONFIRMED,
                FlowXTransferStatus::BOTH_DEPOSITS_CONFIRMED,
                FlowXTransferStatus::PROCESSING_PAYOUT,
                FlowXTransferStatus::COMPLETED,
            ], true),
            depositB: in_array((string) $transfer->status, [
                FlowXTransferStatus::BOTH_DEPOSITS_CONFIRMED,
                FlowXTransferStatus::PROCESSING_PAYOUT,
                FlowXTransferStatus::COMPLETED,
            ], true),
            disputeReason: null,
            ownerId: (string) $transfer->user_id,
            processingPayoutsStartedAt: null,
            auditLog: [
                new AuditLogEntry(CarbonImmutable::parse((string) $transfer->updated_at_value), 'system', 'flowx_transfer_synced'),
            ],
        );
    }

    public function toFlowXStatus(TransactionStatus $status): string
    {
        return match ($status) {
            TransactionStatus::PendingRequest => FlowXTransferStatus::PENDING_REQUEST,
            TransactionStatus::MatchFound => FlowXTransferStatus::MATCH_FOUND,
            TransactionStatus::AwaitingDeposits => FlowXTransferStatus::AWAITING_DEPOSIT,
            TransactionStatus::DepositConfirmedPartially => FlowXTransferStatus::DEPOSIT_CONFIRMED,
            TransactionStatus::BothDepositsConfirmed => FlowXTransferStatus::BOTH_DEPOSITS_CONFIRMED,
            TransactionStatus::ProcessingPayouts => FlowXTransferStatus::PROCESSING_PAYOUT,
            TransactionStatus::Completed => FlowXTransferStatus::COMPLETED,
            TransactionStatus::UnderReview => FlowXTransferStatus::UNDER_REVIEW,
            TransactionStatus::Failed => FlowXTransferStatus::FAILED,
            TransactionStatus::Refunded => FlowXTransferStatus::REFUNDED,
            TransactionStatus::Disputed => FlowXTransferStatus::DISPUTED,
        };
    }

    private function toLegacyStatus(string $status): TransactionStatus
    {
        return match ($status) {
            FlowXTransferStatus::PENDING_REQUEST => TransactionStatus::PendingRequest,
            FlowXTransferStatus::MATCH_FOUND => TransactionStatus::MatchFound,
            FlowXTransferStatus::AWAITING_DEPOSIT => TransactionStatus::AwaitingDeposits,
            FlowXTransferStatus::DEPOSIT_PENDING, FlowXTransferStatus::DEPOSIT_CONFIRMED => TransactionStatus::DepositConfirmedPartially,
            FlowXTransferStatus::BOTH_DEPOSITS_CONFIRMED => TransactionStatus::BothDepositsConfirmed,
            FlowXTransferStatus::PROCESSING_PAYOUT => TransactionStatus::ProcessingPayouts,
            FlowXTransferStatus::COMPLETED => TransactionStatus::Completed,
            FlowXTransferStatus::UNDER_REVIEW => TransactionStatus::UnderReview,
            FlowXTransferStatus::REFUNDED => TransactionStatus::Refunded,
            FlowXTransferStatus::FAILED, FlowXTransferStatus::CANCELLED => TransactionStatus::Failed,
            FlowXTransferStatus::DISPUTED => TransactionStatus::Disputed,
            default => TransactionStatus::PendingRequest,
        };
    }
}
