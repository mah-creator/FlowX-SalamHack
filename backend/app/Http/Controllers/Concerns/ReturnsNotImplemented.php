<?php

namespace App\Http\Controllers\Concerns;

use App\Support\ErrorEnvelope;
use Illuminate\Http\JsonResponse;

trait ReturnsNotImplemented
{
    protected function notImplemented(string $endpointId): JsonResponse
    {
        return ErrorEnvelope::notImplemented($endpointId);
    }
}
