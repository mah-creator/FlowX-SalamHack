<?php

it('lists only transactions owned by the caller', function (): void {
    $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->assertCreated();
    $this->withToken('user-b')->postJson('/transactions', ['amount' => 200, 'currency' => 'EGP'])->assertCreated();

    $this->withToken('user-a')->getJson('/transactions')
        ->assertOk()
        ->assertJsonCount(1, 'transactions')
        ->assertJsonPath('transactions.0.amount', 100);
});

it('returns an empty collection for a new caller', function (): void {
    $this->withToken('fresh-user')->getJson('/transactions')
        ->assertOk()
        ->assertExactJson(['transactions' => []]);
});
