<?php

namespace App\Domain\FlowX;

final class FlowXAuditLogger
{
    public function __construct(
        private readonly FlowXStore $store,
        private readonly FlowXFactory $factory,
    ) {}

    public function log(string $action, string $entityType, string $entityId, string $actorId = 'system', string $actorRole = 'ADMIN'): void
    {
        $this->store->create('auditLogs', $this->factory->resource('auditLogs', [
            'actorId' => $actorId,
            'actorRole' => $actorRole,
            'action' => $action,
            'entityType' => $entityType,
            'entityId' => $entityId,
        ]));
    }
}
