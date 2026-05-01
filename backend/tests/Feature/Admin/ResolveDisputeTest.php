<?php

beforeEach(function (): void {
    config()->set('salamhack.admin_tokens', ['admin-demo-token']);
});

it('resolves disputes to completed and refunded', function (): void {
    $completed = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$completed}/disputes", ['reason' => 'x'])->assertOk();

    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$completed}/resolve-dispute", ['outcome' => 'Completed'])
        ->assertOk()
        ->assertJsonPath('status', 'Completed');

    $refunded = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');
    $this->withToken('user-a')->postJson("/transactions/{$refunded}/disputes", ['reason' => 'x'])->assertOk();

    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$refunded}/resolve-dispute", ['outcome' => 'Refunded'])
        ->assertOk()
        ->assertJsonPath('status', 'Refunded');
});

it('validates dispute resolution outcome and state', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$id}/resolve-dispute", [])
        ->assertUnprocessable();

    $this->withToken('admin-demo-token')->postJson("/admin/transactions/{$id}/resolve-dispute", ['outcome' => 'Completed'])
        ->assertConflict()
        ->assertJsonPath('error.code', 'invalid_state');
});
