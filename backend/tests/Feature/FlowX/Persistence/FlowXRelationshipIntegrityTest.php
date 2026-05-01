<?php

use App\Models\FlowXDispute;
use App\Models\FlowXNotification;
use App\Models\FlowXTransfer;
use App\Models\FlowXWallet;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('rejects writes that reference missing related records without creating orphans', function (): void {
    $this->postJson('/wallets', ['id' => 'wal-orphan', 'userId' => 'missing-user'])
        ->assertStatus(422);
    $this->postJson('/notifications', ['id' => 'not-orphan', 'userId' => 'missing-user'])
        ->assertStatus(422);
    $this->postJson('/transfers', ['id' => 'tr-orphan', 'userId' => 'missing-user'])
        ->assertStatus(422);
    $this->postJson('/disputes', ['id' => 'dsp-orphan', 'userId' => 'usr-user', 'transferId' => 'missing-transfer'])
        ->assertStatus(422);

    expect(FlowXWallet::query()->whereKey('wal-orphan')->exists())->toBeFalse();
    expect(FlowXNotification::query()->whereKey('not-orphan')->exists())->toBeFalse();
    expect(FlowXTransfer::query()->whereKey('tr-orphan')->exists())->toBeFalse();
    expect(FlowXDispute::query()->whereKey('dsp-orphan')->exists())->toBeFalse();
});
