<?php

namespace App\Domain\Transactions;

use App\Domain\Audit\AuditLogEntry;
use Carbon\CarbonImmutable;

final class SettlementClock
{
    public function __construct(private readonly int $paymentWindowMinutes) {}

    public function shouldSettle(Transaction $tx, CarbonImmutable $now): bool
    {
        return $tx->status === TransactionStatus::ProcessingPayouts
            && $tx->processingPayoutsStartedAt !== null
            && $now->diffInMinutes($tx->processingPayoutsStartedAt, true) >= $this->paymentWindowMinutes;
    }

    public function settle(Transaction $tx, CarbonImmutable $now): Transaction
    {
        return $tx->with([
            'status' => TransactionStatus::Completed,
            'auditLog' => [
                ...$tx->auditLog,
                new AuditLogEntry($now, 'system', 'payouts_completed'),
            ],
        ]);
    }
}
