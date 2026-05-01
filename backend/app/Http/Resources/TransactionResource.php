<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source' => $this->source,
            'destination' => $this->destination,
            'amount' => $this->amount,
            'currency' => $this->currency->value,
            'status' => $this->status->value,
            'feePercent' => $this->feePercent,
            'exchangeRate' => $this->exchangeRate,
            'receivableAmount' => $this->receivableAmount,
            'createdAt' => $this->createdAt->toIso8601ZuluString(),
            'depositA' => $this->depositA,
            'depositB' => $this->depositB,
            'disputeReason' => $this->disputeReason,
            'auditLog' => AuditLogEntryResource::collection($this->auditLog),
        ];
    }
}
