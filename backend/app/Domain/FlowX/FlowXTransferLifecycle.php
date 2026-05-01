<?php

namespace App\Domain\FlowX;

use RuntimeException;

final class FlowXTransferLifecycle
{
    public function __construct(
        private readonly FlowXStore $store,
        private readonly FlowXFactory $factory,
    ) {}

    /**
     * Trigger an auto-match search for a pending transfer.
     *
     * Pairs T with the oldest other PENDING_REQUEST transfer that has the
     * opposite corridor (T.source == U.destination AND T.destination ==
     * U.source), the same currency, a different userId, and an amount within
     * +/-10% of T. On a hit, both transfers transition to MATCH_FOUND with
     * mutual counterpartyTransferId references. If no candidate exists the
     * transfer is left untouched (still PENDING_REQUEST) and returned so the
     * frontend can keep polling.
     *
     * @return array<string, mixed>
     */
    public function matchRequest(string $id): array
    {
        $transfer = $this->store->find('transfers', $id);
        if ($transfer === null) {
            throw new RuntimeException('not_found');
        }

        $current = (string) ($transfer['status'] ?? '');

        if ($current === FlowXTransferStatus::MATCH_FOUND) {
            return $transfer;
        }

        if ($current !== FlowXTransferStatus::PENDING_REQUEST) {
            throw new RuntimeException('invalid_transition:'.$current);
        }

        $candidate = $this->findCounterparty($transfer);
        if ($candidate === null) {
            return $transfer;
        }

        $now = $this->factory->now();

        $transfer['status'] = FlowXTransferStatus::MATCH_FOUND;
        $transfer['counterpartyTransferId'] = (string) $candidate['id'];
        $transfer['updatedAt'] = $now;
        $this->store->replace('transfers', $id, $transfer);

        $candidate['status'] = FlowXTransferStatus::MATCH_FOUND;
        $candidate['counterpartyTransferId'] = (string) $transfer['id'];
        $candidate['updatedAt'] = $now;
        $this->store->replace('transfers', (string) $candidate['id'], $candidate);

        return $transfer;
    }

    /**
     * @param  array<string, mixed>  $transfer
     * @return array<string, mixed>|null
     */
    private function findCounterparty(array $transfer): ?array
    {
        $currency = (string) ($transfer['currency'] ?? '');
        $source = (string) ($transfer['sourceCountry'] ?? '');
        $destination = (string) ($transfer['destinationCountry'] ?? '');
        $userId = (string) ($transfer['userId'] ?? '');
        $amount = (float) ($transfer['amount'] ?? 0);

        if ($currency === '' || $source === '' || $destination === '' || $userId === '' || $amount <= 0) {
            return null;
        }

        $candidates = $this->store->all('transfers', [
            'status' => FlowXTransferStatus::PENDING_REQUEST,
            'sourceCountry' => $destination,
            'destinationCountry' => $source,
            'currency' => $currency,
        ]);

        $tolerance = $amount * 0.10;
        $matches = array_values(array_filter(
            $candidates,
            static function (array $row) use ($userId, $amount, $tolerance): bool {
                if ((string) ($row['userId'] ?? '') === $userId) {
                    return false;
                }
                if (! empty($row['counterpartyTransferId'])) {
                    return false;
                }

                return abs(((float) ($row['amount'] ?? 0)) - $amount) <= $tolerance;
            },
        ));

        if ($matches === []) {
            return null;
        }

        usort(
            $matches,
            static fn (array $a, array $b): int => strcmp(
                (string) ($a['createdAt'] ?? ''),
                (string) ($b['createdAt'] ?? ''),
            ),
        );

        return $matches[0];
    }

    /**
     * @return array<string, mixed>
     */
    public function submit(string $id): array
    {
        return $this->transition($id, [FlowXTransferStatus::PENDING_REQUEST, FlowXTransferStatus::MATCH_FOUND], FlowXTransferStatus::AWAITING_DEPOSIT);
    }

    /**
     * @return array<string, mixed>
     */
    public function riskApproval(string $id): array
    {
        return $this->transition($id, [FlowXTransferStatus::UNDER_REVIEW], FlowXTransferStatus::BOTH_DEPOSITS_CONFIRMED);
    }

    /**
     * @return array<string, mixed>
     */
    public function riskRejection(string $id): array
    {
        return $this->transition($id, [FlowXTransferStatus::UNDER_REVIEW], FlowXTransferStatus::FAILED);
    }

    /**
     * @return array<string, mixed>
     */
    public function refund(string $id): array
    {
        return $this->transition($id, [
            FlowXTransferStatus::AWAITING_DEPOSIT,
            FlowXTransferStatus::DEPOSIT_PENDING,
            FlowXTransferStatus::DEPOSIT_CONFIRMED,
            FlowXTransferStatus::BOTH_DEPOSITS_CONFIRMED,
            FlowXTransferStatus::PROCESSING_PAYOUT,
            FlowXTransferStatus::UNDER_REVIEW,
            FlowXTransferStatus::DISPUTED,
        ], FlowXTransferStatus::REFUNDED);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function disputeOpened(string $id): ?array
    {
        $transfer = $this->store->find('transfers', $id);
        if ($transfer === null) {
            return null;
        }

        if (! FlowXTransferStatus::isTerminal((string) ($transfer['status'] ?? ''))) {
            $transfer['status'] = FlowXTransferStatus::DISPUTED;
            $transfer['updatedAt'] = $this->factory->now();
            $this->store->replace('transfers', $id, $transfer);
        }

        return $transfer;
    }

    /**
     * @param  list<string>  $allowed
     * @return array<string, mixed>
     */
    private function transition(string $id, array $allowed, string $result): array
    {
        $transfer = $this->store->find('transfers', $id);
        if ($transfer === null) {
            throw new RuntimeException('not_found');
        }

        $current = (string) ($transfer['status'] ?? '');
        if (! in_array($current, $allowed, true)) {
            throw new RuntimeException('invalid_transition:'.$current);
        }

        $transfer['status'] = $result;
        $transfer['updatedAt'] = $this->factory->now();
        $this->store->replace('transfers', $id, $transfer);

        return $transfer;
    }
}
