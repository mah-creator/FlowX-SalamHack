<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXWallet extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_wallets';

    protected $guarded = [];

    protected $casts = ['balance' => 'float', 'escrow_balance' => 'float', 'available_balance' => 'float'];

    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'balance' => $this->number($this->balance),
            'currency' => $this->currency,
            'escrowBalance' => $this->number($this->escrow_balance),
            'availableBalance' => $this->number($this->available_balance),
        ];
    }

    private function number(mixed $value): int|float
    {
        $float = (float) $value;

        return floor($float) === $float ? (int) $float : $float;
    }
}
