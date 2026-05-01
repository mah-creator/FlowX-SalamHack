<?php

it('keeps generic transfer patch mock-compatible', function (): void {
    $transfer = $this->postJson('/transfers', ['id' => 'tr-patch', 'userId' => 'usr-user', 'amount' => 100])->json();

    $this->patchJson('/transfers/'.$transfer['id'], ['paymentConfirmationRequested' => true])
        ->assertOk()
        ->assertJsonPath('paymentConfirmationRequested', true);

    $this->patchJson('/transfers/'.$transfer['id'], ['status' => 'CANCELLED'])
        ->assertOk()
        ->assertJsonPath('status', 'CANCELLED');
});
