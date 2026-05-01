<?php

use App\Domain\FlowX\FlowXEloquentStore;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('persists verification wallet and notification patches with verification side effects', function (): void {
    $this->patchJson('/verifications/ver-pending', [
        'status' => 'VERIFIED',
        'level' => 'Verified',
        'reviewerId' => 'usr-admin',
    ])->assertOk()->assertJsonPath('status', 'VERIFIED');

    $this->patchJson('/wallets/wal-user', ['availableBalance' => 12000])
        ->assertOk()
        ->assertJsonPath('availableBalance', 12000);

    $this->patchJson('/notifications/not-1001', ['read' => false])
        ->assertOk()
        ->assertJsonPath('read', false);

    $this->app->forgetInstance(FlowXEloquentStore::class);

    $this->getJson('/users/usr-pending')->assertOk()->assertJsonPath('verificationStatus', 'VERIFIED');
    $this->getJson('/wallets?userId=usr-user')->assertOk()->assertJsonFragment(['availableBalance' => 12000]);
    $this->getJson('/notifications?userId=usr-user')->assertOk()->assertJsonFragment(['read' => false]);
});
