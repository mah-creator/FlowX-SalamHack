<?php

namespace App\Domain\Transactions;

use App\Domain\Audit\AuditLogEntry;
use Carbon\CarbonImmutable;

final readonly class Transaction
{
    /**
     * @param  list<AuditLogEntry>  $auditLog
     */
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
        public array $auditLog,
    ) {}

    /**
     * @param  array<string, mixed>  $changes
     */
    public function with(array $changes): self
    {
        return new self(
            $changes['id'] ?? $this->id,
            $changes['source'] ?? $this->source,
            $changes['destination'] ?? $this->destination,
            $changes['amount'] ?? $this->amount,
            $changes['currency'] ?? $this->currency,
            $changes['status'] ?? $this->status,
            $changes['feePercent'] ?? $this->feePercent,
            $changes['exchangeRate'] ?? $this->exchangeRate,
            $changes['receivableAmount'] ?? $this->receivableAmount,
            $changes['createdAt'] ?? $this->createdAt,
            $changes['depositA'] ?? $this->depositA,
            $changes['depositB'] ?? $this->depositB,
            array_key_exists('disputeReason', $changes) ? $changes['disputeReason'] : $this->disputeReason,
            $changes['ownerId'] ?? $this->ownerId,
            array_key_exists('processingPayoutsStartedAt', $changes) ? $changes['processingPayoutsStartedAt'] : $this->processingPayoutsStartedAt,
            $changes['auditLog'] ?? $this->auditLog,
        );
    }
}
