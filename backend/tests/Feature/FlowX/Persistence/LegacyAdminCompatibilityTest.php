<?php

use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('exposes canonical FlowX transfers through legacy admin transaction reads', function (): void {
    $this->withToken('admin-demo-token')
        ->getJson('/admin/transactions?status=Under%20Review')
        ->assertOk()
        ->assertJsonFragment(['id' => 'tr-1002']);

    $this->withToken('admin-demo-token')
        ->postJson('/admin/transactions/tr-1002/approve')
        ->assertOk()
        ->assertJsonPath('status', 'Both Deposits Confirmed');
});
