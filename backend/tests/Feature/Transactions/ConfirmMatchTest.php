<?php

it('confirms a found match', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$id}/auto-match", [])->assertOk();

    $this->withToken('user-a')->postJson("/transactions/{$id}/confirm-match", [])
        ->assertOk()
        ->assertJsonPath('status', 'Awaiting Deposits')
        ->assertJsonPath('auditLog.2.action', 'match_confirmed');
});

it('rejects confirm match from the wrong state', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('user-a')->postJson("/transactions/{$id}/confirm-match", [])
        ->assertConflict()
        ->assertJsonPath('error.code', 'invalid_state');
});
