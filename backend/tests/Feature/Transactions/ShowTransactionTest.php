<?php

it('shows an owned transaction', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('user-a')->getJson("/transactions/{$id}")
        ->assertOk()
        ->assertJsonPath('id', $id);
});

it('returns 404 for unknown transactions and 403 for other owners', function (): void {
    $id = $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->json('id');

    $this->withToken('user-a')->getJson('/transactions/TR-9999')
        ->assertNotFound()
        ->assertJsonPath('error.code', 'not_found');

    $this->withToken('user-b')->getJson("/transactions/{$id}")
        ->assertForbidden()
        ->assertJsonPath('error.code', 'forbidden');
});
