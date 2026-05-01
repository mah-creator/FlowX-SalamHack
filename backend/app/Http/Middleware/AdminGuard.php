<?php

namespace App\Http\Middleware;

use App\Domain\Users\ActorIdentity;
use App\Exceptions\ForbiddenAccessException;
use App\Support\ErrorEnvelope;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminGuard
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken() === null) {
            return ErrorEnvelope::attachRequestId(ErrorEnvelope::unauthenticated(), $request);
        }

        $actor = ActorIdentity::fromBearerToken(
            $request->bearerToken() ?? '',
            (array) config('salamhack.admin_tokens', []),
        );

        if (! $actor->isAdmin) {
            throw new ForbiddenAccessException('admin role required');
        }

        return $next($request);
    }
}
