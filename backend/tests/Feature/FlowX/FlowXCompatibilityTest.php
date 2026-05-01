<?php

it('allows FlowX resource calls without authorization headers', function (): void {
    $this->getJson('/users')->assertOk()->assertJsonIsArray();
    $this->getJson('/transfers')->assertOk()->assertJsonIsArray();
    $this->getJson('/config')->assertOk()->assertJsonPath('id', 'main');
});

it('keeps existing Phase 4 routes protected by bearer middleware', function (): void {
    $this->getJson('/transactions')->assertUnauthorized();
});
