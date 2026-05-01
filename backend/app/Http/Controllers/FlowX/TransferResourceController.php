<?php

namespace App\Http\Controllers\FlowX;

use App\Domain\FlowX\FlowXStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TransferResourceController
{
    use FlowXResponse;

    public function __construct(private readonly FlowXStore $store) {}

    public function index(Request $request): JsonResponse
    {
        return $this->ok($this->store->all('transfers', $request->only(['userId', 'status'])));
    }

    public function show(string $id): JsonResponse
    {
        $row = $this->store->find('transfers', $id);

        return $row === null ? $this->notFound('transfer') : $this->ok($row);
    }

    public function store(Request $request): JsonResponse
    {
        return $this->ok($this->store->create('transfers', $request->all()), 201);
    }

    public function patch(Request $request, string $id): JsonResponse
    {
        $row = $this->store->patch('transfers', $id, $request->all());

        return $row === null ? $this->notFound('transfer') : $this->ok($row);
    }
}
