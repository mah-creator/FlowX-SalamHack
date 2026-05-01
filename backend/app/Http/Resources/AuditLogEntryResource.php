<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'time' => $this->time->toIso8601ZuluString(),
            'actor' => $this->actor,
            'action' => $this->action,
        ];
    }
}
