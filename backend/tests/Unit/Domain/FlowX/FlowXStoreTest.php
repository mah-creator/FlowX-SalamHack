<?php

use App\Domain\FlowX\FlowXStore;

it('loads seeded resources and can reset to the fixture', function (): void {
    $store = app(FlowXStore::class);

    expect($store->all('users'))->toHaveCount(4)
        ->and($store->all('transfers'))->not->toBeEmpty()
        ->and($store->all('wallets'))->not->toBeEmpty()
        ->and($store->all('agents'))->toHaveCount(1)
        ->and($store->config()['feePercent'])->toBe(2);

    $store->create('users', ['email' => 'new@example.test']);
    expect($store->all('users'))->toHaveCount(5);

    $store->reset();
    expect($store->all('users'))->toHaveCount(4);
});

it('creates patches finds and replaces resources', function (): void {
    $store = app(FlowXStore::class);

    $created = $store->create('wallets', ['id' => 'wal-test', 'userId' => 'usr-user']);
    expect($created['currency'])->toBe('USD');

    $patched = $store->patch('wallets', 'wal-test', ['availableBalance' => 15]);
    expect($patched['availableBalance'])->toBe(15)
        ->and($store->find('wallets', 'wal-test')['availableBalance'])->toBe(15);

    $store->replace('wallets', 'wal-test', array_replace($patched, ['availableBalance' => 20]));
    expect($store->find('wallets', 'wal-test')['availableBalance'])->toBe(20);
});
