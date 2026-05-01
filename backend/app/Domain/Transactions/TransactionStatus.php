<?php

namespace App\Domain\Transactions;

enum TransactionStatus: string
{
    case PendingRequest = 'Pending Request';
    case MatchFound = 'Match Found';
    case AwaitingDeposits = 'Awaiting Deposits';
    case DepositConfirmedPartially = 'Deposit Confirmed Partially';
    case BothDepositsConfirmed = 'Both Deposits Confirmed';
    case ProcessingPayouts = 'Processing Payouts';
    case Completed = 'Completed';
    case UnderReview = 'Under Review';
    case Failed = 'Failed';
    case Refunded = 'Refunded';
    case Disputed = 'Disputed';

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Failed, self::Refunded], true);
    }

    public function isActive(): bool
    {
        return ! $this->isTerminal();
    }
}
