<?php

use App\Domain\Transactions\Currency;
use App\Domain\Transactions\SettlementClock;
use App\Domain\Transactions\TransactionFactory;
use App\Domain\Transactions\TransactionStatus;
use App\Domain\Transactions\TransactionStore;
use Carbon\CarbonImmutable;

it('creates transactions with server ids and configured fields', function (): void {
    $store = new TransactionStore(new SettlementClock(1));
    $factory = new TransactionFactory($store, [
        'fee_percent' => 2,
        'exchange_rate' => 1.0,
    ], [
        'source' => 'Gaza',
        'destination' => 'Egypt',
    ], 'TR-');

    $tx = $factory->create('usr-owner', 750, Currency::USD, CarbonImmutable::parse('2026-04-30T12:00:00Z'));

    expect($tx->id)->toBe('TR-0001')
        ->and($tx->status)->toBe(TransactionStatus::PendingRequest)
        ->and($tx->receivableAmount)->toBe(735.0)
        ->and($tx->depositA)->toBeFalse()
        ->and($tx->depositB)->toBeFalse()
        ->and($tx->auditLog)->toHaveCount(1)
        ->and($tx->auditLog[0]->action)->toBe('request_created');
});

it('increments ids from the store sequence', function (): void {
    $store = new TransactionStore(new SettlementClock(1));
    $factory = new TransactionFactory($store, ['fee_percent' => 2, 'exchange_rate' => 1], ['source' => 'Gaza', 'destination' => 'Egypt'], 'TR-');

    expect($factory->nextId())->toBe('TR-0001')
        ->and($factory->nextId())->toBe('TR-0002');
});
