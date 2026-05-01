<?php

beforeEach(function (): void {
    config()->set('salamhack.admin_tokens', ['admin-demo-token']);
});

it('approves an under review transaction', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$id}/flag-risk", [])->assertOk();

    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$id}/approve", [])
        ->assertOk()
        ->assertJsonPath('status', 'Both Deposits Confirmed')
        ->assertJsonPath('auditLog.2.action', 'admin_approved');
});

it('rejects approve from a non review state', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$id}/approve", [])
        ->assertConflict()
        ->assertJsonPath('error.code', 'invalid_state');
});
