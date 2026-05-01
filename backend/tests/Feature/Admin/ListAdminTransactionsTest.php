<?php

beforeEach(function (): void {
    config()->set('salamhack.admin_tokens', ['admin-demo-token']);
});

it('returns transactions across users and filters by status', function (): void {
    $this->withToken('user-a')->postJson('/transactions', ['amount' => 100, 'currency' => 'USD'])->assertCreated();
    $this->withToken('user-b')->postJson('/transactions', ['amount' => 200, 'currency' => 'EGP'])->assertCreated();

    $this->withToken('admin-demo-token')->getJson('/admin/transactions')
        ->assertOk()
        ->assertJsonCount(2, 'transactions');

    $this->withToken('admin-demo-token')->getJson('/admin/transactions?status=Pending%20Request')
        ->assertOk()
        ->assertJsonCount(2, 'transactions');
});

it('rejects non admins and anonymous callers', function (): void {
    $this->withToken('user-a')->getJson('/admin/transactions')
        ->assertForbidden()
        ->assertJsonPath('error.code', 'forbidden');

    $this->withHeaders(['Authorization' => ''])->getJson('/admin/transactions')
        ->assertUnauthorized()
        ->assertJsonPath('error.code', 'unauthenticated');
});
