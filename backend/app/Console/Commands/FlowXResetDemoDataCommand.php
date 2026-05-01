<?php

namespace App\Console\Commands;

use App\Domain\FlowX\FlowXEloquentStore;
use Database\Seeders\FlowXBaselineSeeder;
use Illuminate\Console\Command;

final class FlowXResetDemoDataCommand extends Command
{
    protected $signature = 'flowx:reset-demo-data';

    protected $description = 'Reset local FlowX demo data to the seeded baseline.';

    public function handle(): int
    {
        app(FlowXEloquentStore::class)->reset();
        $this->call(FlowXBaselineSeeder::class);
        $this->info('FlowX demo data reset.');

        return self::SUCCESS;
    }
}
