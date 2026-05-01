<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXActivity extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_activities';

    protected $guarded = [];

    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'createdAt' => $this->created_at_value,
            'type' => $this->type,
        ];
    }
}
