<?php

namespace App\Exceptions;

use RuntimeException;
use Throwable;

class ForbiddenAccessException extends RuntimeException
{
    public function __construct(
        public readonly string $reason,
        ?Throwable $previous = null,
    ) {
        parent::__construct("Forbidden: {$reason}", 0, $previous);
    }
}
