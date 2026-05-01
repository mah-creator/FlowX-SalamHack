<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXRequest extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_requests';

    protected $guarded = [];

    protected $casts = ['payload' => 'array'];

    public function toFlowXArray(): array
    {
        return $this->payload ? array_replace(['id' => $this->id], $this->payload) : ['id' => $this->id];
    }
}
