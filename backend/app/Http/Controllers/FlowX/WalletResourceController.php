<?php

namespace App\Http\Controllers\FlowX;

use App\Domain\FlowX\FlowXStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class WalletResourceController
{
    use FlowXResponse;

    public function __construct(private readonly FlowXStore $store) {}

    public function index(Request $request): JsonResponse
    {
        return $this->ok($this->store->all('wallets', $request->only(['userId', 'status'])));
    }

    public function store(Request $request): JsonResponse
    {
        return $this->ok($this->store->create('wallets', $request->all()), 201);
    }

    public function patch(Request $request, string $id): JsonResponse
    {
        $row = $this->store->patch('wallets', $id, $request->all());

        return $row === null ? $this->notFound('wallet') : $this->ok($row);
    }
}
