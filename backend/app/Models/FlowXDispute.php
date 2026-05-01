<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXDispute extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_disputes';

    protected $guarded = [];

    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'transferId' => $this->transfer_id,
            'userId' => $this->user_id,
            'reason' => $this->reason,
            'evidence' => $this->evidence,
            'status' => $this->status,
            'resolution' => $this->resolution,
            'createdAt' => $this->created_at_value,
            'resolvedAt' => $this->resolved_at_value,
        ];
    }
}
