<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXAuditLog extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_audit_logs';

    protected $guarded = [];

    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'actorId' => $this->actor_id,
            'actorRole' => $this->actor_role,
            'action' => $this->action,
            'entityType' => $this->entity_type,
            'entityId' => $this->entity_id,
            'createdAt' => $this->created_at_value,
        ];
    }
}
