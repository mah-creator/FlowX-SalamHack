<?php

namespace App\Domain\Audit;

use Carbon\CarbonImmutable;

final readonly class AuditLogEntry
{
    public function __construct(
        public CarbonImmutable $time,
        public string $actor,
        public string $action,
    ) {}
}
