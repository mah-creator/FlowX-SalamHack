<?php

it('serves config and audit log admin contract', function (): void {
    $this->getJson('/config')->assertOk()->assertJsonPath('feePercent', 2);
    $this->patchJson('/config', ['feePercent' => 3])->assertOk()->assertJsonPath('feePercent', 3);

    $this->postJson('/auditLogs', [
        'id' => 'audit-new',
        'actorId' => 'usr-admin',
        'actorRole' => 'ADMIN',
        'action' => 'MANUAL',
        'entityType' => 'config',
        'entityId' => 'main',
        'createdAt' => '2026-04-30T00:00:00.000Z',
    ])->assertCreated()->assertJsonPath('action', 'MANUAL');

    $this->getJson('/auditLogs')->assertOk()->assertJsonFragment(['id' => 'audit-new']);
});
