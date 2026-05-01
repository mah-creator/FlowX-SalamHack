<?php

it('cancels pending and match found transactions', function (): void {
    $pending = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$pending}/cancel", [])
        ->assertOk()
        ->assertJsonPath('status', 'Failed')
        ->assertJsonPath('auditLog.1.action', 'cancelled');

    $matched = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$matched}/auto-match", [])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$matched}/cancel", [])->assertOk()->assertJsonPath('status', 'Failed');
});

it('rejects cancel after awaiting deposits', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$id}/auto-match", [])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$id}/confirm-match", [])->assertOk();

    $this->withToken('user-a')->postJson("/transactions/{$id}/cancel", [])
        ->assertConflict()
        ->assertJsonPath('error.code', 'invalid_state');
});
