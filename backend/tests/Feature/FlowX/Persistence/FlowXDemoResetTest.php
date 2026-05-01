<?php

use App\Models\FlowXUser;
use Illuminate\Support\Facades\Artisan;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('resets demo data only when the explicit command is run', function (): void {
    $this->postJson('/users', [
        'id' => 'usr-reset-me',
        'fullName' => 'Reset Me',
        'email' => 'reset-me@flowx.demo',
        'password' => 'secret',
    ])->assertCreated();

    Artisan::call('db:seed');
    expect(FlowXUser::query()->whereKey('usr-reset-me')->exists())->toBeTrue();

    Artisan::call('flowx:reset-demo-data');
    expect(FlowXUser::query()->whereKey('usr-reset-me')->exists())->toBeFalse();
    expect(FlowXUser::query()->whereKey('usr-user')->exists())->toBeTrue();
});
