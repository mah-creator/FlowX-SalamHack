<?php

use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('serves representative Phase 4.5 contract calls from SQLite', function (): void {
    $this->getJson('/users?email=user@flowx.demo&password=user123')
        ->assertOk()
        ->assertJsonPath('0.id', 'usr-user');

    $this->getJson('/wallets?userId=usr-user')
        ->assertOk()
        ->assertJsonPath('0.userId', 'usr-user');

    $this->getJson('/transfers?status=UNDER_REVIEW')
        ->assertOk()
        ->assertJsonPath('0.status', 'UNDER_REVIEW');

    $this->getJson('/config')
        ->assertOk()
        ->assertJsonPath('id', 'main');

    $this->getJson('/agents')
        ->assertOk()
        ->assertJsonPath('0.id', 'agt-001');
});
