<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXConfiguration extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_configurations';

    protected $guarded = [];

    protected $casts = [
        'fee_percent' => 'float',
        'exchange_rate' => 'float',
        'supported_countries' => 'array',
        'supported_currencies' => 'array',
        'supported_corridors' => 'array',
        'payment_window_minutes' => 'integer',
    ];

    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'feePercent' => $this->number($this->fee_percent),
            'exchangeRate' => $this->number($this->exchange_rate),
            'supportedCountries' => $this->supported_countries ?? [],
            'supportedCurrencies' => $this->supported_currencies ?? [],
            'supportedCorridors' => $this->supported_corridors ?? [],
            'paymentWindowMinutes' => (int) $this->payment_window_minutes,
        ];
    }

    private function number(mixed $value): int|float
    {
        $float = (float) $value;

        return floor($float) === $float ? (int) $float : $float;
    }
}
