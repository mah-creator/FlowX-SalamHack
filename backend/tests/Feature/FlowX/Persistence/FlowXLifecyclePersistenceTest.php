<?php

use App\Domain\FlowX\FlowXEloquentStore;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('persists legal transfer lifecycle actions and rejects invalid transitions', function (): void {
    $created = $this->postJson('/transfers', [
        'id' => 'tr-lifecycle',
        'userId' => 'usr-user',
        'amount' => 100,
        'receiverName' => 'Receiver',
    ])->assertCreated()->json();

    $this->postJson('/transfers/'.$created['id'].'/match-request')->assertOk()->assertJsonPath('status', 'MATCH_FOUND');
    $this->postJson('/transfers/'.$created['id'].'/submit')->assertOk()->assertJsonPath('status', 'AWAITING_DEPOSIT');
    $this->postJson('/transfers/'.$created['id'].'/match-request')->assertStatus(409);

    $this->patchJson('/transfers/tr-1002', ['status' => 'UNDER_REVIEW'])->assertOk();
    $this->postJson('/transfers/tr-1002/risk-approval')->assertOk()->assertJsonPath('status', 'BOTH_DEPOSITS_CONFIRMED');

    $this->app->forgetInstance(FlowXEloquentStore::class);
    $this->getJson('/transfers/'.$created['id'])->assertOk()->assertJsonPath('status', 'AWAITING_DEPOSIT');
    $this->getJson('/transfers/tr-1002')->assertOk()->assertJsonPath('status', 'BOTH_DEPOSITS_CONFIRMED');
});
