<?php

namespace App\Http\Controllers\FlowX;

use Illuminate\Http\JsonResponse;

trait FlowXResponse
{
    protected function ok(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status);
    }

    protected function notFound(string $resource = 'resource'): JsonResponse
    {
        return response()->json([
            'error' => [
                'code' => 'not_found',
                'message' => "{$resource} not found",
            ],
        ], 404);
    }

    protected function invalidTransition(string $message): JsonResponse
    {
        return response()->json([
            'error' => [
                'code' => 'invalid_state',
                'message' => $message,
            ],
        ], 409);
    }

    protected function validationFailed(array $errors): JsonResponse
    {
        return response()->json([
            'error' => [
                'code' => 'validation_failed',
                'message' => 'The given data was invalid.',
                'details' => $errors,
            ],
        ], 422);
    }
}
