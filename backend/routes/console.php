<?php

use App\Console\Commands\FlowXResetDemoDataCommand;
use App\Domain\FlowX\FlowXEloquentStore;
use Database\Seeders\FlowXBaselineSeeder;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('flowx:reset-demo-data', function (): int {
    app(FlowXEloquentStore::class)->reset();
    $this->call(FlowXBaselineSeeder::class);
    $this->info('FlowX demo data reset.');

    return FlowXResetDemoDataCommand::SUCCESS;
})->purpose('Reset local FlowX demo data to the seeded baseline');
