<?php

use Illuminate\Support\Facades\Route;

it('registers FlowX resource routes and existing Phase 4 compatibility routes', function (): void {
    $expected = [
        ['GET', 'users'],
        ['POST', 'users'],
        ['GET', 'users/{id}'],
        ['PATCH', 'users/{id}'],
        ['GET', 'wallets'],
        ['POST', 'wallets'],
        ['PATCH', 'wallets/{id}'],
        ['GET', 'transfers'],
        ['POST', 'transfers'],
        ['GET', 'transfers/{id}'],
        ['PATCH', 'transfers/{id}'],
        ['POST', 'transfers/{id}/match-request'],
        ['POST', 'transfers/{id}/submit'],
        ['POST', 'transfers/{id}/risk-approval'],
        ['POST', 'transfers/{id}/risk-rejection'],
        ['POST', 'transfers/{id}/refund'],
        ['GET', 'verifications'],
        ['POST', 'verifications'],
        ['PATCH', 'verifications/{id}'],
        ['GET', 'notifications'],
        ['POST', 'notifications'],
        ['PATCH', 'notifications/{id}'],
        ['GET', 'disputes'],
        ['POST', 'disputes'],
        ['PATCH', 'disputes/{id}'],
        ['GET', 'config'],
        ['PATCH', 'config'],
        ['GET', 'auditLogs'],
        ['POST', 'auditLogs'],
        ['GET', 'agents'],
        ['GET', 'paymentMethods'],
        ['GET', 'analytics'],
        ['GET', 'activities'],
        ['GET', 'requests'],
        ['GET', 'transactions'],
        ['POST', 'transactions'],
        ['POST', 'auth/login'],
    ];

    $routes = collect(Route::getRoutes())->map(fn ($route): array => [
        'uri' => $route->uri(),
        'methods' => $route->methods(),
    ]);

    foreach ($expected as [$method, $uri]) {
        expect($routes->contains(fn ($route): bool => $route['uri'] === $uri && in_array($method, $route['methods'], true)))->toBeTrue($method.' '.$uri);
    }
});
