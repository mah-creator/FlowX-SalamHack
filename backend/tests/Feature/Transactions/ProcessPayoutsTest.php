<?php

it('processes payouts and lazily completes after the settlement window', function (): void {
    config()->set('salamhack.demo_config.payment_window_minutes', 0);

    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$id}/auto-match", [])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$id}/confirm-match", [])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$id}/deposits", ['party' => 'A'])->assertOk();
    $this->withToken('user-a')->postJson("/transactions/{$id}/deposits", ['party' => 'B'])->assertOk();

    $this->withToken('user-a')->postJson("/transactions/{$id}/process-payouts", [])
        ->assertOk()
        ->assertJsonPath('status', 'Processing Payouts');

    $this->withToken('user-a')->getJson("/transactions/{$id}")
        ->assertOk()
        ->assertJsonPath('status', 'Completed');
});

it('rejects payouts before both deposits are confirmed', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('user-a')->postJson("/transactions/{$id}/process-payouts", [])
        ->assertConflict()
        ->assertJsonPath('error.code', 'invalid_state');
});
