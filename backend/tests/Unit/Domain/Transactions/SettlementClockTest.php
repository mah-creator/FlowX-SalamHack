<?php

use App\Domain\Audit\AuditLogEntry;
use App\Domain\Transactions\Currency;
use App\Domain\Transactions\SettlementClock;
use App\Domain\Transactions\Transaction;
use App\Domain\Transactions\TransactionStatus;
use Carbon\CarbonImmutable;

function settlementTestTx(TransactionStatus $status, ?CarbonImmutable $startedAt): Transaction
{
    $now = CarbonImmutable::parse('2026-04-30T12:00:00Z');

    return new Transaction('TR-0001', 'Gaza', 'Egypt', 100, Currency::USD, $status, 2, 1, 98, $now, true, true, null, 'usr-owner', $startedAt, [
        new AuditLogEntry($now, 'usr-owner', 'payouts_processing_started'),
    ]);
}

it('does not settle before the configured window', function (): void {
    $clock = new SettlementClock(1);
    $tx = settlementTestTx(TransactionStatus::ProcessingPayouts, CarbonImmutable::parse('2026-04-30T12:00:00Z'));

    expect($clock->shouldSettle($tx, CarbonImmutable::parse('2026-04-30T12:00:30Z')))->toBeFalse();
});

it('settles processing payouts after the configured window', function (): void {
    $clock = new SettlementClock(1);
    $tx = settlementTestTx(TransactionStatus::ProcessingPayouts, CarbonImmutable::parse('2026-04-30T12:00:00Z'));

    $settled = $clock->settle($tx, CarbonImmutable::parse('2026-04-30T12:01:01Z'));

    expect($clock->shouldSettle($tx, CarbonImmutable::parse('2026-04-30T12:01:01Z')))->toBeTrue()
        ->and($settled->status)->toBe(TransactionStatus::Completed)
        ->and($settled->auditLog)->toHaveCount(2)
        ->and($settled->auditLog[1]->actor)->toBe('system')
        ->and($settled->auditLog[1]->action)->toBe('payouts_completed');
});
