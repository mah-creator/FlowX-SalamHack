<?php

namespace App\Domain\Transactions;

use App\Domain\Audit\AuditLogEntry;
use App\Models\FlowXTransfer;
use Carbon\CarbonImmutable;
use RuntimeException;
use Throwable;

final class TransactionStore
{
    /** @var array<string, Transaction> */
    private static array $byId = [];

    private static int $nextSequence = 1;

    private static bool $loaded = false;

    public function __construct(
        private readonly SettlementClock $clock,
        private readonly ?FlowXTransactionCompatibilityMapper $flowxMapper = null,
    ) {}

    public function put(Transaction $tx): void
    {
        $this->load();
        self::$byId[$tx->id] = $tx;
        $this->persist();
    }

    public function get(string $id): ?Transaction
    {
        $this->load();

        if (! isset(self::$byId[$id])) {
            return $this->flowxTransaction($id);
        }

        return $this->settleIfDue(self::$byId[$id]);
    }

    public function replace(string $id, Transaction $tx): void
    {
        $this->load();

        if (! isset(self::$byId[$id])) {
            $flowx = $this->flowxTransfer($id);
            if ($flowx === null) {
                throw new RuntimeException("Cannot replace missing transaction {$id}.");
            }

            $flowx->status = $this->mapper()->toFlowXStatus($tx->status);
            $flowx->updated_at_value = CarbonImmutable::now()->toISOString();
            $flowx->save();

            return;
        }

        self::$byId[$id] = $tx;
        $this->persist();
    }

    /**
     * @return list<Transaction>
     */
    public function all(): iterable
    {
        $this->load();

        $legacy = array_values(array_map(
            fn (Transaction $tx): Transaction => $this->settleIfDue($tx),
            self::$byId,
        ));

        if ($legacy !== []) {
            return $legacy;
        }

        $merged = $this->flowxTransactions();
        foreach ($legacy as $tx) {
            $merged[$tx->id] = $tx;
        }

        return array_values($merged);
    }

    /**
     * @return list<Transaction>
     */
    public function ownedBy(string $ownerId): iterable
    {
        return array_values(array_filter(
            $this->all(),
            fn (Transaction $tx): bool => $tx->ownerId === $ownerId,
        ));
    }

    public function peekNextSequence(): int
    {
        $this->load();

        return self::$nextSequence;
    }

    public function bumpSequence(): int
    {
        $this->load();
        $sequence = self::$nextSequence++;
        $this->persist();

        return $sequence;
    }

    public function reset(): void
    {
        self::resetGlobal();
    }

    public static function resetGlobal(): void
    {
        self::$byId = [];
        self::$nextSequence = 1;
        self::$loaded = true;

        $path = self::storagePath();
        if (is_file($path)) {
            @unlink($path);
        }
    }

    private function settleIfDue(Transaction $tx): Transaction
    {
        $now = CarbonImmutable::now();
        $settled = $this->clock->shouldSettle($tx, $now) ? $this->clock->settle($tx, $now) : $tx;

        if ($settled !== $tx) {
            self::$byId[$tx->id] = $settled;
            $this->persist();
        }

        return $settled;
    }

    private function flowxTransaction(string $id): ?Transaction
    {
        $transfer = $this->flowxTransfer($id);

        return $transfer === null ? null : $this->mapper()->fromFlowX($transfer);
    }

    /**
     * @return array<string, Transaction>
     */
    private function flowxTransactions(): array
    {
        try {
            return FlowXTransfer::query()
                ->get()
                ->mapWithKeys(fn (FlowXTransfer $transfer): array => [
                    (string) $transfer->id => $this->mapper()->fromFlowX($transfer),
                ])
                ->all();
        } catch (Throwable) {
            return [];
        }
    }

    private function flowxTransfer(string $id): ?FlowXTransfer
    {
        try {
            $transfer = FlowXTransfer::query()->find($id);

            return $transfer instanceof FlowXTransfer ? $transfer : null;
        } catch (Throwable) {
            return null;
        }
    }

    private function mapper(): FlowXTransactionCompatibilityMapper
    {
        return $this->flowxMapper ?? app(FlowXTransactionCompatibilityMapper::class);
    }

    private function load(): void
    {
        if (self::$loaded) {
            return;
        }

        self::$loaded = true;
        $path = self::storagePath();

        if (! is_file($path)) {
            return;
        }

        $payload = json_decode((string) file_get_contents($path), true);

        if (! is_array($payload)) {
            return;
        }

        self::$nextSequence = (int) ($payload['nextSequence'] ?? 1);
        self::$byId = [];

        foreach (($payload['transactions'] ?? []) as $row) {
            if (is_array($row)) {
                $tx = self::hydrate($row);
                self::$byId[$tx->id] = $tx;
            }
        }
    }

    private function persist(): void
    {
        $path = self::storagePath();
        $dir = dirname($path);

        if (! is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        file_put_contents($path, json_encode([
            'nextSequence' => self::$nextSequence,
            'transactions' => array_map(
                fn (Transaction $tx): array => self::dehydrate($tx),
                array_values(self::$byId),
            ),
        ], JSON_PRETTY_PRINT));
    }

    private static function storagePath(): string
    {
        if (function_exists('storage_path')) {
            try {
                return storage_path('framework/salamhack-transactions.json');
            } catch (Throwable) {
                // Unit tests that do not boot Laravel still load helper functions.
            }
        }

        return sys_get_temp_dir().DIRECTORY_SEPARATOR.'salamhack-transactions.json';
    }

    private static function hydrate(array $row): Transaction
    {
        return new Transaction(
            id: (string) $row['id'],
            source: (string) $row['source'],
            destination: (string) $row['destination'],
            amount: (float) $row['amount'],
            currency: Currency::from((string) $row['currency']),
            status: TransactionStatus::from((string) $row['status']),
            feePercent: (float) $row['feePercent'],
            exchangeRate: (float) $row['exchangeRate'],
            receivableAmount: (float) $row['receivableAmount'],
            createdAt: CarbonImmutable::parse((string) $row['createdAt']),
            depositA: (bool) $row['depositA'],
            depositB: (bool) $row['depositB'],
            disputeReason: $row['disputeReason'] ?? null,
            ownerId: (string) $row['ownerId'],
            processingPayoutsStartedAt: isset($row['processingPayoutsStartedAt']) ? CarbonImmutable::parse((string) $row['processingPayoutsStartedAt']) : null,
            auditLog: array_map(
                fn (array $entry): AuditLogEntry => new AuditLogEntry(
                    CarbonImmutable::parse((string) $entry['time']),
                    (string) $entry['actor'],
                    (string) $entry['action'],
                ),
                $row['auditLog'] ?? [],
            ),
        );
    }

    private static function dehydrate(Transaction $tx): array
    {
        return [
            'id' => $tx->id,
            'source' => $tx->source,
            'destination' => $tx->destination,
            'amount' => $tx->amount,
            'currency' => $tx->currency->value,
            'status' => $tx->status->value,
            'feePercent' => $tx->feePercent,
            'exchangeRate' => $tx->exchangeRate,
            'receivableAmount' => $tx->receivableAmount,
            'createdAt' => $tx->createdAt->toIso8601ZuluString(),
            'depositA' => $tx->depositA,
            'depositB' => $tx->depositB,
            'disputeReason' => $tx->disputeReason,
            'ownerId' => $tx->ownerId,
            'processingPayoutsStartedAt' => $tx->processingPayoutsStartedAt?->toIso8601ZuluString(),
            'auditLog' => array_map(fn (AuditLogEntry $entry): array => [
                'time' => $entry->time->toIso8601ZuluString(),
                'actor' => $entry->actor,
                'action' => $entry->action,
            ], $tx->auditLog),
        ];
    }
}
