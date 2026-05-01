<?php

use App\Domain\FlowX\FlowXFilters;

it('filters collections by exact field matches', function (): void {
    $rows = [
        ['email' => 'user@flowx.demo', 'password' => 'user123', 'userId' => 'usr-user', 'status' => 'active'],
        ['email' => 'admin@flowx.demo', 'password' => 'admin123', 'userId' => 'usr-admin', 'status' => 'active'],
        ['email' => 'pending@flowx.local', 'password' => 'user123', 'userId' => 'usr-pending', 'status' => 'pending'],
    ];

    $filters = new FlowXFilters;

    expect($filters->exact($rows, ['email' => 'user@flowx.demo', 'password' => 'user123']))->toHaveCount(1)
        ->and($filters->exact($rows, ['userId' => 'usr-user']))->toHaveCount(1)
        ->and($filters->exact($rows, ['status' => 'active']))->toHaveCount(2)
        ->and($filters->exact($rows, ['email' => 'missing@example.test']))->toBe([]);
});
