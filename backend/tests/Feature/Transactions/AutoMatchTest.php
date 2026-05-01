<?php

it('auto matches a pending transaction', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('user-a')->postJson("/transactions/{$id}/auto-match", [])
        ->assertOk()
        ->assertJsonPath('status', 'Match Found')
        ->assertJsonPath('auditLog.1.action', 'auto_matched');
});

it('rejects illegal auto match and foreign owners', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('user-a')->postJson("/transactions/{$id}/auto-match", [])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$id}/auto-match", [])
        ->assertConflict()
        ->assertJsonPath('error.code', 'invalid_state');

    $other = $this->withToken('user-b')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$other}/auto-match", [])
        ->assertForbidden()
        ->assertJsonPath('error.code', 'forbidden');
});
