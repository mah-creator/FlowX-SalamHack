<?php

namespace App\Models\Concerns;

trait HasFlowXStringId
{
    public function getIncrementing(): bool
    {
        return false;
    }

    public function getKeyType(): string
    {
        return 'string';
    }
}
