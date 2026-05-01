<?php

namespace App\Http\Requests\FlowX;

use Illuminate\Foundation\Http\FormRequest;

class TransferActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        if (str_ends_with($this->path(), '/risk-rejection') || str_ends_with($this->path(), '/refund')) {
            return [
                'reason' => ['nullable', 'string', 'max:1000'],
            ];
        }

        return [];
    }
}
