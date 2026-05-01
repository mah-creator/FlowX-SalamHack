<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ReturnsNotImplemented;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    use ReturnsNotImplemented;

    public function signup(): JsonResponse
    {
        return $this->notImplemented('EP-015');
    }

    public function verify(): JsonResponse
    {
        return $this->notImplemented('EP-016');
    }

    public function login(): JsonResponse
    {
        return $this->notImplemented('EP-017');
    }

    public function logout(): JsonResponse
    {
        return $this->notImplemented('EP-018');
    }
}
