<?php

use Illuminate\Support\Facades\Route;

it('registers healthz without bearer auth middleware', function (): void {
    $route = collect(Route::getRoutes())->first(fn ($route): bool => $route->uri() === 'healthz');

    expect($route)->not->toBeNull();
    expect($route->methods())->toContain('GET');
    expect($route->gatherMiddleware())->not->toContain('auth.bearer.presence');
});
