<?php

it('creates a transaction and ignores client supplied id', function (): void {
    $response = $this->withToken('user-a')->postJson('/transactions', [
        'id' => 'TR-9999',
        'amount' => 750,
        'currency' => 'USD',
    ]);

    $response->assertCreated()
        ->assertJsonPath('id', 'TR-0001')
        ->assertJsonPath('status', 'Pending Request')
        ->assertJsonPath('depositA', false)
        ->assertJsonPath('depositB', false)
        ->assertJsonPath('auditLog.0.action', 'request_created');
});

it('validates create transaction payload', function (): void {
    $this->withToken('user-a')->postJson('/transactions', [
        'amount' => 0,
        'currency' => 'BAD',
    ])->assertUnprocessable()
        ->assertJsonPath('error.code', 'validation_failed');
});
