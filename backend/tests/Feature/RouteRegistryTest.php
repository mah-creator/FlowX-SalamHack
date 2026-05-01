<?php

use Illuminate\Support\Facades\Route;

it('registers all Phase 1 routes without api prefix', function (): void {
    $expected = [
        ['GET', 'transactions'],
        ['GET', 'transactions/{id}'],
        ['POST', 'transactions'],
        ['POST', 'transactions/{id}/cancel'],
        ['POST', 'transactions/{id}/confirm-match'],
        ['POST', 'transactions/{id}/deposits'],
        ['POST', 'transactions/{id}/process-payouts'],
        ['POST', 'transactions/{id}/disputes'],
        ['GET', 'admin/transactions'],
        ['POST', 'transactions/{id}/auto-match'],
        ['POST', 'admin/transactions/{id}/flag-risk'],
        ['POST', 'admin/transactions/{id}/approve'],
        ['POST', 'admin/transactions/{id}/refund'],
        ['POST', 'admin/transactions/{id}/resolve-dispute'],
        ['POST', 'auth/signup'],
        ['POST', 'auth/verify'],
        ['POST', 'auth/login'],
        ['POST', 'auth/logout'],
    ];

    $routes = collect(Route::getRoutes())->map(fn ($route): array => [
        'uri' => $route->uri(),
        'methods' => $route->methods(),
    ]);

    foreach ($expected as [$method, $uri]) {
        expect($routes->contains(fn ($route): bool => $route['uri'] === $uri && in_array($method, $route['methods'], true)))->toBeTrue();
    }

    $phaseOneRoutes = collect($expected)->map(fn (array $route): string => $route[1])->all();

    expect($routes->filter(
        fn ($route): bool => in_array(str_replace('api/', '', $route['uri']), $phaseOneRoutes, true)
            && str_starts_with($route['uri'], 'api/'),
    ))->toHaveCount(0);
});
