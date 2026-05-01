<?php

namespace App\Http\Controllers\FlowX;

use App\Domain\FlowX\FlowXStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AuditLogResourceController
{
    use FlowXResponse;

    public function __construct(private readonly FlowXStore $store) {}

    public function index(): JsonResponse
    {
        return $this->ok($this->store->all('auditLogs'));
    }

    public function store(Request $request): JsonResponse
    {
        return $this->ok($this->store->create('auditLogs', $request->all()), 201);
    }
}
