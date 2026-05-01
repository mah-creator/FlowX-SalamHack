<?php

namespace App\Http\Controllers\FlowX;

use App\Domain\FlowX\FlowXAuditLogger;
use App\Domain\FlowX\FlowXTransferLifecycle;
use App\Http\Requests\FlowX\TransferActionRequest;
use Illuminate\Http\JsonResponse;
use RuntimeException;

final class TransferActionController
{
    use FlowXResponse;

    public function __construct(
        private readonly FlowXTransferLifecycle $lifecycle,
        private readonly FlowXAuditLogger $auditLogger,
    ) {}

    public function matchRequest(string $id): JsonResponse
    {
        return $this->action(fn () => $this->lifecycle->matchRequest($id));
    }

    public function submit(string $id): JsonResponse
    {
        return $this->action(fn () => $this->lifecycle->submit($id));
    }

    public function riskApproval(string $id): JsonResponse
    {
        return $this->action(function () use ($id): array {
            $row = $this->lifecycle->riskApproval($id);
            $this->auditLogger->log('APPROVE_RISK_REVIEW', 'transfer', $id);

            return $row;
        });
    }

    public function riskRejection(TransferActionRequest $request, string $id): JsonResponse
    {
        return $this->action(function () use ($id): array {
            $row = $this->lifecycle->riskRejection($id);
            $this->auditLogger->log('REJECT_RISK_REVIEW', 'transfer', $id);

            return $row;
        });
    }

    public function refund(TransferActionRequest $request, string $id): JsonResponse
    {
        return $this->action(function () use ($id): array {
            $row = $this->lifecycle->refund($id);
            $this->auditLogger->log('REFUND_TRANSFER', 'transfer', $id);

            return $row;
        });
    }

    /**
     * @param  callable(): array<string, mixed>  $callback
     */
    private function action(callable $callback): JsonResponse
    {
        try {
            return $this->ok($callback());
        } catch (RuntimeException $exception) {
            if ($exception->getMessage() === 'not_found') {
                return $this->notFound('transfer');
            }

            return $this->invalidTransition($exception->getMessage());
        }
    }
}
