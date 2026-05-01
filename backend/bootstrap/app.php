<?php

use App\Exceptions\ForbiddenAccessException;
use App\Exceptions\InvalidStateException;
use App\Exceptions\OwnershipDeniedException;
use App\Http\Middleware\AdminGuard;
use App\Http\Middleware\BearerPresenceAuth;
use App\Http\Middleware\StrictCorsOrigin;
use App\Http\Middleware\StructuredRequestLog;
use App\Support\ErrorEnvelope;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        apiPrefix: '',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(StrictCorsOrigin::class);
        $middleware->append(HandleCors::class);
        $middleware->append(StructuredRequestLog::class);

        $middleware->alias([
            'auth.bearer.presence' => BearerPresenceAuth::class,
            'admin.guard' => AdminGuard::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn (Request $request, Throwable $e): bool => true);

        $exceptions->render(function (ValidationException $e, Request $request) {
            return ErrorEnvelope::attachRequestId(
                ErrorEnvelope::validationFailed($e->errors()),
                $request,
            );
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            return ErrorEnvelope::attachRequestId(
                ErrorEnvelope::notFound(),
                $request,
            );
        });

        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            $allow = $e->getHeaders()['Allow'] ?? '';

            return ErrorEnvelope::attachRequestId(
                ErrorEnvelope::methodNotAllowed($allow === '' ? [] : explode(', ', $allow)),
                $request,
            );
        });

        $exceptions->render(function (InvalidStateException $e, Request $request) {
            return ErrorEnvelope::attachRequestId(
                ErrorEnvelope::invalidState($e->endpointId, $e->currentStatus),
                $request,
            );
        });

        $exceptions->render(function (OwnershipDeniedException $e, Request $request) {
            return ErrorEnvelope::attachRequestId(
                ErrorEnvelope::forbidden("ownership denied for {$e->resourceId}"),
                $request,
            );
        });

        $exceptions->render(function (ForbiddenAccessException $e, Request $request) {
            return ErrorEnvelope::attachRequestId(
                ErrorEnvelope::forbidden($e->reason),
                $request,
            );
        });

        $exceptions->render(function (RuntimeException $e, Request $request) {
            if (in_array($e->getMessage(), ['missing_user', 'missing_transfer'], true)) {
                return response()->json([
                    'error' => [
                        'code' => 'validation_failed',
                        'message' => 'The given data was invalid.',
                        'details' => ['relationship' => [$e->getMessage()]],
                    ],
                ], 422);
            }

            return null;
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            return ErrorEnvelope::attachRequestId(
                ErrorEnvelope::internalError(),
                $request,
            );
        });
    })->create();
