<?php

use App\Domain\FlowX\FlowXEloquentStore;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('persists dispute open and resolve workflow with linked transfer state', function (): void {
    $transfer = $this->postJson('/transfers', [
        'id' => 'tr-dispute-flow',
        'userId' => 'usr-user',
        'amount' => 200,
    ])->assertCreated()->json();

    $this->postJson('/disputes', [
        'id' => 'dsp-dispute-flow',
        'transferId' => $transfer['id'],
        'userId' => 'usr-user',
        'reason' => 'Needs review',
    ])->assertCreated()->assertJsonPath('id', 'dsp-dispute-flow');

    $this->getJson('/transfers/'.$transfer['id'])->assertOk()->assertJsonPath('status', 'DISPUTED');

    $this->patchJson('/disputes/dsp-dispute-flow', [
        'status' => 'RESOLVED',
        'resolution' => 'Resolved by admin',
    ])->assertOk()->assertJsonPath('status', 'RESOLVED');

    $this->app->forgetInstance(FlowXEloquentStore::class);
    $this->getJson('/disputes?userId=usr-user')->assertOk()->assertJsonFragment(['id' => 'dsp-dispute-flow']);
    $this->getJson('/auditLogs')->assertOk()->assertJsonFragment(['entityId' => 'dsp-dispute-flow']);
});
