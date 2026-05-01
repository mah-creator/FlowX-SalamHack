<?php

namespace App\Http\Controllers\FlowX;

use App\Domain\FlowX\FlowXStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class NotificationResourceController
{
    use FlowXResponse;

    public function __construct(private readonly FlowXStore $store) {}

    public function index(Request $request): JsonResponse
    {
        return $this->ok($this->store->all('notifications', $request->only(['userId', 'status'])));
    }

    public function store(Request $request): JsonResponse
    {
        return $this->ok($this->store->create('notifications', $request->all()), 201);
    }

    public function patch(Request $request, string $id): JsonResponse
    {
        $row = $this->store->patch('notifications', $id, $request->all());

        return $row === null ? $this->notFound('notification') : $this->ok($row);
    }
}
