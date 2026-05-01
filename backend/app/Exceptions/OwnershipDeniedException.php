<?php

namespace App\Exceptions;

use Throwable;

final class OwnershipDeniedException extends ForbiddenAccessException
{
    public function __construct(
        public readonly string $resourceId,
        ?Throwable $previous = null,
    ) {
        parent::__construct("ownership denied for {$resourceId}", $previous);
    }
}
