<?php

namespace App\Http\Controllers\FlowX;

use App\Domain\FlowX\FlowXAuditLogger;
use App\Domain\FlowX\FlowXStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ConfigResourceController
{
    use FlowXResponse;

    public function __construct(
        private readonly FlowXStore $store,
        private readonly FlowXAuditLogger $auditLogger,
    ) {}

    public function show(): JsonResponse
    {
        return $this->ok($this->store->config());
    }

    public function patch(Request $request): JsonResponse
    {
        $row = $this->store->patchConfig($request->all());
        $this->auditLogger->log('UPDATE_CONFIG', 'config', (string) ($row['id'] ?? 'main'));

        return $this->ok($row);
    }
}
