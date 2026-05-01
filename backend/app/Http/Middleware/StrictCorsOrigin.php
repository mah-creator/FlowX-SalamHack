<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StrictCorsOrigin
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin');

        if ($origin !== null && ! in_array($origin, config('cors.allowed_origins', []), true)) {
            return response()->json([
                'error' => [
                    'code' => 'cors_origin_denied',
                    'message' => 'The request origin is not allowed.',
                    'details' => (object) [],
                ],
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
