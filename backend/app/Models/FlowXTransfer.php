<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class FlowXTransfer extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_transfers';

    protected $guarded = [];

    protected $casts = [
        'amount' => 'float',
        'fee' => 'float',
        'exchange_rate' => 'float',
        'net_amount' => 'float',
        'payment_confirmation_requested' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(FlowXUser::class, 'user_id');
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(FlowXDispute::class, 'transfer_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'sourceCountry' => $this->source_country,
            'destinationCountry' => $this->destination_country,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'fee' => (float) $this->fee,
            'exchangeRate' => (float) $this->exchange_rate,
            'netAmount' => (float) $this->net_amount,
            'status' => $this->status,
            'paymentMethod' => $this->payment_method,
            'receiverName' => $this->receiver_name,
            'receiverPaymentMethod' => $this->receiver_payment_method,
            'referenceNumber' => $this->reference_number,
            'createdAt' => $this->created_at_value,
            'updatedAt' => $this->updated_at_value,
            'riskLevel' => $this->risk_level,
            'paymentConfirmationRequested' => (bool) $this->payment_confirmation_requested,
            'counterpartyTransferId' => $this->counterparty_transfer_id,
        ];
    }
}
