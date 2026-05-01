<?php

use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('runs representative Phase 4 and FlowX requests in one persistent test', function (): void {
    $this->getJson('/transfers?userId=usr-user')->assertOk()->assertJsonFragment(['id' => 'tr-1001']);
    $this->withToken('usr-user')->getJson('/transactions/tr-1001')->assertOk()->assertJsonPath('id', 'tr-1001');
    $this->getJson('/config')->assertOk()->assertJsonPath('id', 'main');
    $this->withToken('admin-demo-token')->getJson('/admin/transactions')->assertOk()->assertJsonFragment(['id' => 'tr-1002']);
});
