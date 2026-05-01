<?php

$authenticatedRoutes = [
    ['GET', '/transactions'],
    ['GET', '/transactions/TR-0000'],
    ['POST', '/transactions'],
    ['POST', '/transactions/TR-0000/cancel'],
    ['POST', '/transactions/TR-0000/confirm-match'],
    ['POST', '/transactions/TR-0000/deposits'],
    ['POST', '/transactions/TR-0000/process-payouts'],
    ['POST', '/transactions/TR-0000/disputes'],
    ['GET', '/admin/transactions'],
    ['POST', '/transactions/TR-0000/auto-match'],
    ['POST', '/admin/transactions/TR-0000/flag-risk'],
    ['POST', '/admin/transactions/TR-0000/approve'],
    ['POST', '/admin/transactions/TR-0000/refund'],
    ['POST', '/admin/transactions/TR-0000/resolve-dispute'],
    ['POST', '/auth/verify'],
    ['POST', '/auth/logout'],
];

it('rejects all authenticated Phase 1 routes when Bearer token is missing', function (string $method, string $uri): void {
    $this->json($method, $uri)
        ->assertUnauthorized()
        ->assertJsonPath('error.code', 'unauthenticated');
})->with($authenticatedRoutes);
