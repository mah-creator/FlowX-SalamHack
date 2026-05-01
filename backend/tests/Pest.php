<?php

use App\Domain\FlowX\FlowXStore;
use App\Domain\Transactions\TransactionStore;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

pest()->extend(TestCase::class)->in('Feature', 'Unit');

pest()->beforeEach(function (): void {
    FlowXStore::resetGlobal();
    TransactionStore::resetGlobal();
    Artisan::call('migrate:fresh');
    Artisan::call('db:seed');
})->in('Unit', 'Feature');
