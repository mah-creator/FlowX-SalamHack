<?php

beforeEach(function (): void {
    config()->set('salamhack.admin_tokens', ['admin-demo-token']);
});

it('refunds an active transaction', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$id}/refund", [])
        ->assertOk()
        ->assertJsonPath('status', 'Refunded')
        ->assertJsonPath('auditLog.1.action', 'admin_refunded');
});

it('rejects refund from terminal state', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$id}/cancel", [])->assertOk();

    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$id}/refund", [])
        ->assertConflict()
        ->assertJsonPath('error.code', 'invalid_state');
});
