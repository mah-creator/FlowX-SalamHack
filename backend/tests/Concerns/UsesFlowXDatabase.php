<?php

namespace Tests\Concerns;

use Illuminate\Support\Facades\Artisan;

trait UsesFlowXDatabase
{
    protected function seedFlowXBaseline(): void
    {
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\FlowXBaselineSeeder',
        ]);
    }
}
