<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXAnalyticsMetric extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_analytics';

    protected $guarded = [];

    protected $casts = ['value' => 'float', 'change' => 'float'];

    public function toFlowXArray(): array
    {
        return ['id' => $this->id, 'label' => $this->label, 'value' => (float) $this->value, 'change' => (float) $this->change];
    }
}
