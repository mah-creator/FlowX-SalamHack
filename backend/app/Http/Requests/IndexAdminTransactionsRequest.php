<?php

namespace App\Http\Requests;

use App\Domain\Transactions\TransactionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexAdminTransactionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::in(array_map(
                fn (TransactionStatus $status): string => $status->value,
                TransactionStatus::cases(),
            ))],
        ];
    }
}
