<?php

it('loads admin dashboard resource collections and config', function (): void {
    $this->getJson('/users')->assertOk()->assertJsonIsArray();
    $this->getJson('/transfers')->assertOk()->assertJsonIsArray();
    $this->getJson('/verifications')->assertOk()->assertJsonIsArray();
    $this->getJson('/disputes')->assertOk()->assertJsonIsArray();
    $this->getJson('/auditLogs')->assertOk()->assertJsonIsArray();
    $this->getJson('/config')->assertOk()->assertJsonPath('supportedCurrencies.0', 'USD');
});
