<?php

namespace App\Domain\Transactions;

use App\Domain\Audit\AuditLogEntry;
use Carbon\CarbonImmutable;

final class TransactionFactory
{
    public function __construct(
        private readonly TransactionStore $store,
        private readonly array $demoConfig,
        private readonly array $transactionDefaults,
        private readonly string $idPrefix,
    ) {}

    public function nextId(): string
    {
        return sprintf('%s%04d', $this->idPrefix, $this->store->bumpSequence());
    }

    public function create(string $ownerId, float $amount, Currency $currency, CarbonImmutable $now): Transaction
    {
        $feePercent = (float) ($this->demoConfig['fee_percent'] ?? 2);
        $exchangeRate = (float) ($this->demoConfig['exchange_rate'] ?? 1.0);

        return new Transaction(
            id: $this->nextId(),
            source: (string) ($this->transactionDefaults['source'] ?? 'Gaza'),
            destination: (string) ($this->transactionDefaults['destination'] ?? 'Egypt'),
            amount: $amount,
            currency: $currency,
            status: TransactionStatus::PendingRequest,
            feePercent: $feePercent,
            exchangeRate: $exchangeRate,
            receivableAmount: round($amount * $exchangeRate * (1 - $feePercent / 100), 2),
            createdAt: $now,
            depositA: false,
            depositB: false,
            disputeReason: null,
            ownerId: $ownerId,
            processingPayoutsStartedAt: null,
            auditLog: [new AuditLogEntry($now, $ownerId, 'request_created')],
        );
    }
}
