<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXAgent extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_agents';

    protected $guarded = [];

    protected $casts = ['capacity' => 'float', 'verified' => 'boolean'];

    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'name' => $this->name,
            'region' => $this->region,
            'status' => $this->status,
            'capacity' => (float) $this->capacity,
            'verified' => (bool) $this->verified,
        ];
    }
}
