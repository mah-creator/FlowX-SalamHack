<?php

beforeEach(function (): void {
    config()->set('salamhack.admin_tokens', ['admin-demo-token']);
});

it('flags an active transaction', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$id}/flag-risk", [])
        ->assertOk()
        ->assertJsonPath('status', 'Under Review')
        ->assertJsonPath('auditLog.1.action', 'flagged_for_review');
});

it('rejects non admin flag risk calls', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('user-a')->postJson("/admin/transactions/{$id}/flag-risk", [])
        ->assertForbidden();
});
