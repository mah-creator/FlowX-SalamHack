<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXPaymentMethod extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_payment_methods';

    protected $guarded = [];

    public function toFlowXArray(): array
    {
        return ['id' => $this->id, 'label' => $this->label];
    }
}
