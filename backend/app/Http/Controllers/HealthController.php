<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'salamhack-backend',
            'version' => config('app.version'),
        ]);
    }
}
