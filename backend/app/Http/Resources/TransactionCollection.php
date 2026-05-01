<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class TransactionCollection extends ResourceCollection
{
    public static $wrap = null;

    public $collects = TransactionResource::class;

    public function toArray(Request $request): array
    {
        return [
            'transactions' => $this->collection,
        ];
    }
}
