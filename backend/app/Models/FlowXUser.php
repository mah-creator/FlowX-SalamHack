<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class FlowXUser extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_users';

    protected $guarded = [];

    protected $casts = [
        'verified' => 'boolean',
        'trust_score' => 'integer',
    ];

    public function transfers(): HasMany
    {
        return $this->hasMany(FlowXTransfer::class, 'user_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'fullName' => $this->full_name,
            'email' => $this->email,
            'password' => $this->password,
            'role' => $this->role,
            'accountType' => $this->account_type,
            'country' => $this->country,
            'phone' => $this->phone,
            'verified' => (bool) $this->verified,
            'kycLevel' => $this->kyc_level,
            'verificationStatus' => $this->verification_status,
            'trustScore' => (int) $this->trust_score,
            'status' => $this->status,
            'createdAt' => $this->created_at_value,
        ];
    }
}
