<?php

namespace App\Http\Controllers\FlowX;

use App\Domain\FlowX\FlowXStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class UserResourceController
{
    use FlowXResponse;

    public function __construct(private readonly FlowXStore $store) {}

    public function index(Request $request): JsonResponse
    {
        return $this->ok($this->store->all('users', $request->only(['email', 'password', 'userId', 'status'])));
    }

    public function show(string $id): JsonResponse
    {
        $row = $this->store->find('users', $id);

        return $row === null ? $this->notFound('user') : $this->ok($row);
    }

    public function store(Request $request): JsonResponse
    {
        return $this->ok($this->store->create('users', $request->all()), 201);
    }

    public function patch(Request $request, string $id): JsonResponse
    {
        $row = $this->store->patch('users', $id, $request->all());

        return $row === null ? $this->notFound('user') : $this->ok($row);
    }
}
