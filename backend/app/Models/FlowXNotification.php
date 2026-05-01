<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXNotification extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_notifications';

    protected $guarded = [];

    protected $casts = ['read' => 'boolean'];

    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'title' => $this->title,
            'message' => $this->message,
            'read' => (bool) $this->read,
            'type' => $this->type,
            'createdAt' => $this->created_at_value,
        ];
    }
}
