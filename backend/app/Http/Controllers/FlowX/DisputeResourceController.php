<?php

namespace App\Http\Controllers\FlowX;

use App\Domain\FlowX\FlowXAuditLogger;
use App\Domain\FlowX\FlowXFactory;
use App\Domain\FlowX\FlowXStore;
use App\Domain\FlowX\FlowXTransferLifecycle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DisputeResourceController
{
    use FlowXResponse;

    public function __construct(
        private readonly FlowXStore $store,
        private readonly FlowXTransferLifecycle $lifecycle,
        private readonly FlowXAuditLogger $auditLogger,
        private readonly FlowXFactory $factory,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return $this->ok($this->store->all('disputes', $request->only(['userId', 'status'])));
    }

    public function store(Request $request): JsonResponse
    {
        $row = $this->store->create('disputes', $request->all());
        $this->lifecycle->disputeOpened((string) ($row['transferId'] ?? ''));

        return $this->ok($row, 201);
    }

    public function patch(Request $request, string $id): JsonResponse
    {
        $payload = $request->all();
        if (isset($payload['status']) && in_array($payload['status'], ['RESOLVED', 'REJECTED'], true) && ! isset($payload['resolvedAt'])) {
            $payload['resolvedAt'] = $this->factory->now();
        }

        $row = $this->store->patch('disputes', $id, $payload);
        if ($row === null) {
            return $this->notFound('dispute');
        }

        if (isset($payload['status']) && in_array($payload['status'], ['RESOLVED', 'REJECTED'], true)) {
            $this->auditLogger->log('RESOLVE_DISPUTE', 'dispute', $id);
        }

        return $this->ok($row);
    }
}
