<?php

use App\Domain\FlowX\FlowXStore;
use App\Domain\FlowX\FlowXTransferLifecycle;
use App\Domain\FlowX\FlowXTransferStatus;

it('applies legal transfer action transitions', function (): void {
    $store = app(FlowXStore::class);
    $lifecycle = app(FlowXTransferLifecycle::class);

    $transfer = $store->create('transfers', ['id' => 'tr-life', 'userId' => 'usr-user', 'amount' => 100]);

    expect($transfer['status'])->toBe(FlowXTransferStatus::PENDING_REQUEST)
        ->and($lifecycle->matchRequest('tr-life')['status'])->toBe(FlowXTransferStatus::MATCH_FOUND)
        ->and($lifecycle->submit('tr-life')['status'])->toBe(FlowXTransferStatus::AWAITING_DEPOSIT)
        ->and($lifecycle->refund('tr-life')['status'])->toBe(FlowXTransferStatus::REFUNDED);
});

it('rejects invalid action transitions without mutation', function (): void {
    $store = app(FlowXStore::class);
    $lifecycle = app(FlowXTransferLifecycle::class);

    $store->create('transfers', ['id' => 'tr-bad', 'status' => FlowXTransferStatus::COMPLETED]);

    expect(fn () => $lifecycle->matchRequest('tr-bad'))->toThrow(RuntimeException::class)
        ->and($store->find('transfers', 'tr-bad')['status'])->toBe(FlowXTransferStatus::COMPLETED);
});
