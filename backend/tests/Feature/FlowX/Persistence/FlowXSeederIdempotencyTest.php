<?php

use App\Models\FlowXAgent;
use App\Models\FlowXConfiguration;
use App\Models\FlowXPaymentMethod;
use App\Models\FlowXUser;
use App\Models\FlowXWallet;
use Illuminate\Support\Facades\Artisan;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('does not duplicate baseline records or remove user-created records when reseeded', function (): void {
    $this->postJson('/users', [
        'id' => 'usr-extra',
        'fullName' => 'Extra User',
        'email' => 'extra@flowx.demo',
        'password' => 'secret',
    ])->assertCreated();

    $baselineCounts = [
        FlowXUser::class => FlowXUser::query()->count(),
        FlowXWallet::class => FlowXWallet::query()->count(),
        FlowXConfiguration::class => FlowXConfiguration::query()->count(),
        FlowXAgent::class => FlowXAgent::query()->count(),
        FlowXPaymentMethod::class => FlowXPaymentMethod::query()->count(),
    ];

    Artisan::call('db:seed');
    Artisan::call('db:seed');
    Artisan::call('db:seed');

    foreach ($baselineCounts as $model => $count) {
        expect($model::query()->count())->toBe($count);
    }

    expect(FlowXUser::query()->whereKey('usr-extra')->exists())->toBeTrue();
});
