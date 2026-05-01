<?php

use App\Providers\AppServiceProvider;

it('allows the configured frontend origin for preflight requests', function (): void {
    $this->withHeaders([
        'Origin' => 'http://localhost:3000',
        'Access-Control-Request-Method' => 'GET',
    ])->options('/healthz')
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
});

it('does not allow an unconfigured origin for preflight requests', function (): void {
    $this->withHeaders([
        'Origin' => 'http://evil.example',
        'Access-Control-Request-Method' => 'GET',
    ])->options('/healthz')
        ->assertForbidden()
        ->assertHeaderMissing('Access-Control-Allow-Origin');
});

it('rejects wildcard cors outside local development', function (): void {
    expect(AppServiceProvider::configurationErrors([
        'app_key' => 'base64:'.str_repeat('a', 43),
        'app_env' => 'production',
        'cors_allowed_origins' => '*',
    ]))->toContain('CORS_ALLOWED_ORIGINS cannot contain * outside APP_ENV=local.');
});
