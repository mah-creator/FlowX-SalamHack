<?php

namespace App\Http\Middleware;

use App\Support\ErrorEnvelope;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BearerPresenceAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = trim((string) $request->headers->get('Authorization', ''));

        if (! preg_match('/^Bearer\s+\S+$/', $header)) {
            return ErrorEnvelope::attachRequestId(ErrorEnvelope::unauthenticated(), $request);
        }

        return $next($request);
    }
}
