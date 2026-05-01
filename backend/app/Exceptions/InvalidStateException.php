<?php

namespace App\Exceptions;

use RuntimeException;
use Throwable;

final class InvalidStateException extends RuntimeException
{
    public function __construct(
        public readonly string $endpointId,
        public readonly string $currentStatus,
        public readonly string $attemptedAction,
        ?Throwable $previous = null,
    ) {
        parent::__construct("Invalid state '{$currentStatus}' for action '{$attemptedAction}' on endpoint {$endpointId}.", 0, $previous);
    }
}
