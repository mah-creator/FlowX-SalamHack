<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class StructuredRequestLog
{
    public function handle(Request $request, Closure $next): Response
    {
        $startedAt = microtime(true);
        $requestId = $request->headers->get('X-Request-Id') ?: (string) Str::uuid();
        $request->attributes->set('request_id', $requestId);

        /** @var Response $response */
        $response = $next($request);
        $response->headers->set('X-Request-Id', $requestId);

        Log::info('request.completed', [
            'method' => $request->method(),
            'path' => '/'.ltrim($request->path(), '/'),
            'status' => $response->getStatusCode(),
            'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
            'request_id' => $requestId,
        ]);

        return $response;
    }
}
