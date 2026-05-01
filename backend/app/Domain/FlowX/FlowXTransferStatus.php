<?php

namespace App\Domain\FlowX;

final class FlowXTransferStatus
{
    public const PENDING_REQUEST = 'PENDING_REQUEST';

    public const MATCH_FOUND = 'MATCH_FOUND';

    public const AWAITING_DEPOSIT = 'AWAITING_DEPOSIT';

    public const DEPOSIT_PENDING = 'DEPOSIT_PENDING';

    public const DEPOSIT_CONFIRMED = 'DEPOSIT_CONFIRMED';

    public const BOTH_DEPOSITS_CONFIRMED = 'BOTH_DEPOSITS_CONFIRMED';

    public const PROCESSING_PAYOUT = 'PROCESSING_PAYOUT';

    public const COMPLETED = 'COMPLETED';

    public const UNDER_REVIEW = 'UNDER_REVIEW';

    public const DISPUTED = 'DISPUTED';

    public const REFUNDED = 'REFUNDED';

    public const FAILED = 'FAILED';

    public const CANCELLED = 'CANCELLED';

    /**
     * @return list<string>
     */
    public static function terminal(): array
    {
        return [
            self::COMPLETED,
            self::REFUNDED,
            self::FAILED,
            self::CANCELLED,
        ];
    }

    public static function isTerminal(string $status): bool
    {
        return in_array($status, self::terminal(), true);
    }
}
