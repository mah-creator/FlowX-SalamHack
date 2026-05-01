<?php

it('returns 200 ok from the health endpoint', function (): void {
    $this->getJson('/healthz')
        ->assertOk()
        ->assertJson([
            'status' => 'ok',
            'service' => 'salamhack-backend',
            'version' => '0.1.0',
        ]);
});

it('returns 401 unauthenticated when an authenticated endpoint is hit anonymously', function (): void {
    $this->getJson('/transactions')
        ->assertUnauthorized()
        ->assertJsonPath('error.code', 'unauthenticated');
});

it('returns the implemented EP-001 collection shape', function (): void {
    $this->withHeader('Authorization', 'Bearer testtoken')
        ->getJson('/transactions')
        ->assertOk()
        ->assertExactJson(['transactions' => []]);
});

it('returns the canonical not_found envelope on an unknown path', function (): void {
    $this->getJson('/this/does/not/exist')
        ->assertNotFound()
        ->assertJsonPath('error.code', 'not_found');
});

it('passes the auth middleware when any non-empty Bearer token is present', function (): void {
    $this->withHeader('Authorization', 'Bearer any-fixture-token')
        ->getJson('/transactions')
        ->assertOk()
        ->assertExactJson(['transactions' => []]);
});
