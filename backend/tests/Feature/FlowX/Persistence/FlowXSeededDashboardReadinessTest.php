<?php

use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('loads seeded user and admin dashboard resources from an empty database', function (): void {
    $this->getJson('/users?email=user@flowx.demo&password=user123')->assertOk()->assertJsonPath('0.id', 'usr-user');
    $this->getJson('/users?email=admin@flowx.demo&password=admin123')->assertOk()->assertJsonPath('0.id', 'usr-admin');
    $this->getJson('/wallets?userId=usr-user')->assertOk()->assertJsonPath('0.id', 'wal-user');
    $this->getJson('/verifications?userId=usr-user')->assertOk()->assertJsonPath('0.id', 'ver-user');
    $this->getJson('/notifications?userId=usr-user')->assertOk()->assertJsonPath('0.id', 'not-1001');
    $this->getJson('/disputes')->assertOk()->assertJsonPath('0.id', 'dsp-1001');
    $this->getJson('/auditLogs')->assertOk()->assertJsonPath('0.id', 'audit-1001');
    $this->getJson('/paymentMethods')->assertOk()->assertJsonPath('0.id', 'bank_transfer');
    $this->getJson('/analytics')->assertOk()->assertJsonPath('0.id', 'ana-001');
    $this->getJson('/activities')->assertOk()->assertJsonPath('0.id', 'act-001');
    $this->getJson('/requests')->assertOk()->assertExactJson([]);
});
