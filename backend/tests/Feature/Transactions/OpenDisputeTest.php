<?php

it('opens a dispute with a reason', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('user-a')->postJson("/transactions/{$id}/disputes", ['reason' => 'deposit not received'])
        ->assertOk()
        ->assertJsonPath('status', 'Disputed')
        ->assertJsonPath('disputeReason', 'deposit not received')
        ->assertJsonPath('auditLog.1.action', 'dispute_opened');
});

it('validates dispute reason and rejects repeated disputes', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('user-a')->postJson("/transactions/{$id}/disputes", [])->assertUnprocessable();
    $this->withToken('user-a')->postJson("/transactions/{$id}/disputes", ['reason' => 'x'])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$id}/disputes", ['reason' => 'x'])
        ->assertConflict()
        ->assertJsonPath('error.code', 'invalid_state');
});
