<?php

namespace App\Models;

use App\Models\Concerns\HasFlowXStringId;
use Illuminate\Database\Eloquent\Model;

final class FlowXVerification extends Model
{
    use HasFlowXStringId;

    protected $table = 'flowx_verifications';

    protected $guarded = [];

    public function toFlowXArray(): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'status' => $this->status,
            'level' => $this->level,
            'documentType' => $this->document_type,
            'submittedAt' => $this->submitted_at_value,
            'reviewedAt' => $this->reviewed_at_value,
            'reviewerId' => $this->reviewer_id,
            'rejectionReason' => $this->rejection_reason,
        ];
    }
}
