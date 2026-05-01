<?php

use App\Models\FlowXTransfer;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('exposes canonical FlowX transfers through legacy transaction reads', function (): void {
    $this->withToken('usr-user')
        ->getJson('/transactions/tr-1001')
        ->assertOk()
        ->assertJsonPath('id', 'tr-1001')
        ->assertJsonPath('source', 'Gaza')
        ->assertJsonPath('status', 'Match Found');

    $this->withToken('usr-user')
        ->postJson('/transactions/tr-1001/confirm-match')
        ->assertOk()
        ->assertJsonPath('status', 'Awaiting Deposits');

    expect(FlowXTransfer::query()->find('tr-1001')->status)->toBe('AWAITING_DEPOSIT');
});
