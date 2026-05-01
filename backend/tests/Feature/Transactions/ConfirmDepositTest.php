<?php

it('confirms both deposits', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$id}/auto-match", [])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$id}/confirm-match", [])->assertOk();

    $this->withToken('user-a')->postJson("/transactions/{$id}/deposits", ['party' => 'A'])
        ->assertOk()
        ->assertJsonPath('status', 'Deposit Confirmed Partially')
        ->assertJsonPath('depositA', true);

    $this->withToken('user-a')->postJson("/transactions/{$id}/deposits", ['party' => 'B'])
        ->assertOk()
        ->assertJsonPath('status', 'Both Deposits Confirmed')
        ->assertJsonPath('depositB', true);
});

it('validates deposit party and rejects duplicate deposit', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$id}/auto-match", [])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$id}/confirm-match", [])->assertOk();

    $this->withToken('user-a')->postJson("/transactions/{$id}/deposits", [])->assertUnprocessable();
    $this->withToken('user-a')->postJson("/transactions/{$id}/deposits", ['party' => 'A'])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$id}/deposits", ['party' => 'A'])
        ->assertConflict()
        ->assertJsonPath('error.code', 'invalid_state');
});
