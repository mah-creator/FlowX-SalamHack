<?php

it('creates reads filters and patches FlowX transfers', function (): void {
    $transfer = $this->postJson('/transfers', [
        'userId' => 'usr-user',
        'sourceCountry' => 'Gaza',
        'destinationCountry' => 'Egypt',
        'amount' => 100,
        'currency' => 'USD',
        'paymentMethod' => 'FlowX Wallet',
        'receiverName' => 'Receiver',
        'receiverPaymentMethod' => 'Bank Transfer',
    ])->assertCreated()
        ->assertJsonPath('status', 'PENDING_REQUEST')
        ->assertJsonPath('fee', 2)
        ->json();

    $this->getJson('/transfers/'.$transfer['id'])->assertOk()->assertJsonPath('referenceNumber', $transfer['referenceNumber']);
    $this->getJson('/transfers?userId=usr-user')->assertOk()->assertJsonFragment(['id' => $transfer['id']]);
    $this->patchJson('/transfers/'.$transfer['id'], ['paymentConfirmationRequested' => true])->assertOk()->assertJsonPath('paymentConfirmationRequested', true);
});
