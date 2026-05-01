<?php

use App\Domain\FlowX\FlowXEloquentStore;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('keeps config updates and audit logs after store reload', function (): void {
    $this->patchJson('/config', [
        'feePercent' => 3.5,
        'paymentWindowMinutes' => 45,
    ])->assertOk()
        ->assertJsonPath('feePercent', 3.5)
        ->assertJsonPath('paymentWindowMinutes', 45);

    $this->postJson('/auditLogs', [
        'id' => 'audit-durability',
        'actorId' => 'usr-admin',
        'actorRole' => 'ADMIN',
        'action' => 'DURABILITY_CHECK',
        'entityType' => 'config',
        'entityId' => 'main',
    ])->assertCreated();

    $this->app->forgetInstance(FlowXEloquentStore::class);

    $this->getJson('/config')->assertOk()->assertJsonPath('feePercent', 3.5);
    $this->getJson('/auditLogs')->assertOk()->assertJsonFragment(['id' => 'audit-durability']);
});
