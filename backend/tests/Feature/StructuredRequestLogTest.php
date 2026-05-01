<?php

use Illuminate\Support\Facades\Log;

it('logs one structured event per request', function (): void {
    Log::spy();

    $this->getJson('/healthz')->assertOk();

    Log::shouldHaveReceived('info')
        ->once()
        ->with('request.completed', Mockery::on(fn (array $context): bool => isset(
            $context['method'],
            $context['path'],
            $context['status'],
            $context['duration_ms'],
            $context['request_id'],
        ) && $context['method'] === 'GET'
            && $context['path'] === '/healthz'
            && $context['status'] === 200));
});
