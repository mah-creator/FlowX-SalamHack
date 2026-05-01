<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class ErrorEnvelope
{
    public static function notImplemented(string $endpointId): JsonResponse
    {
        return self::response(
            'not_implemented',
            'This endpoint is registered but not yet implemented (Phase 2 stub).',
            Response::HTTP_NOT_IMPLEMENTED,
            ['endpoint_id' => $endpointId],
        );
    }

    public static function unauthenticated(): JsonResponse
    {
        return self::response('unauthenticated', 'Authentication credentials were not provided.', Response::HTTP_UNAUTHORIZED);
    }

    public static function notFound(): JsonResponse
    {
        return self::response('not_found', 'The requested resource was not found.', Response::HTTP_NOT_FOUND);
    }

    public static function methodNotAllowed(array $allowedMethods): JsonResponse
    {
        return self::response(
            'method_not_allowed',
            'The HTTP method is not allowed for this route.',
            Response::HTTP_METHOD_NOT_ALLOWED,
            ['allowed_methods' => array_values($allowedMethods)],
            ['Allow' => implode(', ', $allowedMethods)],
        );
    }

    public static function validationFailed(array $errors): JsonResponse
    {
        return self::response('validation_failed', 'The given data was invalid.', Response::HTTP_UNPROCESSABLE_ENTITY, $errors);
    }

    public static function invalidState(string $endpointId, string $currentStatus): JsonResponse
    {
        return self::response(
            'invalid_state',
            "The transaction's current state does not permit this action.",
            Response::HTTP_CONFLICT,
            ['endpoint_id' => $endpointId, 'current_status' => $currentStatus],
        );
    }

    public static function forbidden(string $reason): JsonResponse
    {
        return self::response(
            'forbidden',
            'The authenticated user cannot perform this action.',
            Response::HTTP_FORBIDDEN,
            ['reason' => $reason],
        );
    }

    public static function internalError(): JsonResponse
    {
        return self::response('internal_error', 'An internal server error occurred.', Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    public static function attachRequestId(JsonResponse $response, ?Request $request = null): JsonResponse
    {
        $requestId = $request?->attributes->get('request_id') ?: $request?->headers->get('X-Request-Id');

        if ($requestId) {
            $response->headers->set('X-Request-Id', $requestId);
        }

        return $response;
    }

    private static function response(
        string $code,
        string $message,
        int $status,
        array $details = [],
        array $headers = [],
    ): JsonResponse {
        return response()->json([
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => (object) $details,
            ],
        ], $status, $headers);
    }
}
