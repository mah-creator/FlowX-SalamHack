<?php

it('serves static workspace resource collections', function (): void {
    $this->getJson('/agents')->assertOk()->assertJsonPath('0.id', 'agt-001');
    $this->getJson('/paymentMethods')->assertOk()->assertJsonPath('0.id', 'bank_transfer');
    $this->getJson('/analytics')->assertOk()->assertJsonPath('0.id', 'ana-001');
    $this->getJson('/activities')->assertOk()->assertJsonPath('0.id', 'act-001');
    $this->getJson('/requests')->assertOk()->assertExactJson([]);
});
