<?php

use App\Domain\FlowX\FlowXEloquentStore;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('keeps created and patched transfers after store reload', function (): void {
    $transfer = $this->postJson('/transfers', [
        'userId' => 'usr-user',
        'sourceCountry' => 'Gaza',
        'destinationCountry' => 'Egypt',
        'amount' => 100,
        'currency' => 'USD',
        'paymentMethod' => 'FlowX Wallet',
        'receiverName' => 'Receiver',
        'receiverPaymentMethod' => 'Bank Transfer',
    ])->assertCreated()->json();

    $this->patchJson('/transfers/'.$transfer['id'], [
        'paymentConfirmationRequested' => true,
    ])->assertOk()->assertJsonPath('paymentConfirmationRequested', true);

    $this->app->forgetInstance(FlowXEloquentStore::class);

    $this->getJson('/transfers/'.$transfer['id'])
        ->assertOk()
        ->assertJsonPath('id', $transfer['id'])
        ->assertJsonPath('userId', 'usr-user')
        ->assertJsonPath('paymentConfirmationRequested', true);

    $this->getJson('/transfers?userId=usr-user')
        ->assertOk()
        ->assertJsonFragment(['id' => $transfer['id']]);
});
