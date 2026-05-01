<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

it('returns method_not_allowed envelope with allow header', function (): void {
    $this->withHeader('Authorization', 'Bearer testtoken')
        ->getJson('/auth/login')
        ->assertStatus(405)
        ->assertHeader('Allow')
        ->assertJsonPath('error.code', 'method_not_allowed');
});

it('returns validation_failed envelope for validation exceptions', function (): void {
    Route::post('/_test-validation', function (Request $request): void {
        $validator = Validator::make($request->all(), ['name' => ['required', 'string']]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    });

    $this->postJson('/_test-validation', [])
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'validation_failed')
        ->assertJsonStructure(['error' => ['code', 'message', 'details']]);
});

it('returns internal_error envelope without stack trace for uncaught exceptions', function (): void {
    Route::get('/_test-exception', fn () => throw new RuntimeException('Sensitive stack detail'));

    $this->getJson('/_test-exception')
        ->assertStatus(500)
        ->assertJsonPath('error.code', 'internal_error')
        ->assertJsonMissing(['message' => 'Sensitive stack detail']);
});
