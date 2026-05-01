<?php

namespace App\Http\Controllers\FlowX;

use App\Domain\FlowX\FlowXAuditLogger;
use App\Domain\FlowX\FlowXStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class VerificationResourceController
{
    use FlowXResponse;

    public function __construct(
        private readonly FlowXStore $store,
        private readonly FlowXAuditLogger $auditLogger,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return $this->ok($this->store->all('verifications', $request->only(['userId', 'status'])));
    }

    public function store(Request $request): JsonResponse
    {
        return $this->ok($this->store->create('verifications', $request->all()), 201);
    }

    public function patch(Request $request, string $id): JsonResponse
    {
        $row = $this->store->patch('verifications', $id, $request->all());
        if ($row === null) {
            return $this->notFound('verification');
        }

        $status = (string) ($request->input('status') ?? '');
        $actions = [
            'VERIFIED' => 'APPROVE_VERIFICATION',
            'REJECTED' => 'REJECT_VERIFICATION',
            'NEEDS_INFO' => 'REQUEST_VERIFICATION_INFO',
        ];
        if (isset($actions[$status])) {
            $this->auditLogger->log($actions[$status], 'verification', $id, (string) ($request->input('reviewerId') ?? 'system'));
            $this->store->patch('users', (string) ($row['userId'] ?? ''), [
                'verified' => $status === 'VERIFIED',
                'kycLevel' => (string) ($row['level'] ?? 'Basic'),
                'verificationStatus' => $status,
            ]);
        }

        return $this->ok($row);
    }
}
