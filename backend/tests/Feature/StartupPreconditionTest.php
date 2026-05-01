<?php

use App\Providers\AppServiceProvider;

it('reports malformed cors origins', function (): void {
    expect(AppServiceProvider::configurationErrors([
        'app_key' => 'base64:'.str_repeat('a', 43),
        'app_env' => 'local',
        'cors_allowed_origins' => 'localhost:3000',
    ]))->toContain('CORS_ALLOWED_ORIGINS entries must be absolute http(s) origins.');
});

it('reports missing app key', function (): void {
    expect(AppServiceProvider::configurationErrors([
        'app_key' => '',
        'app_env' => 'local',
        'cors_allowed_origins' => 'http://localhost:3000',
    ]))->toContain('APP_KEY is required. Run php artisan key:generate.');
});
