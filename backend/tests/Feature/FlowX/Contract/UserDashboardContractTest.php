<?php

it('loads demo user dashboard resources with userId filters', function (): void {
    $this->getJson('/wallets?userId=usr-user')->assertOk()->assertJsonCount(1)->assertJsonPath('0.currency', 'USD');
    $this->getJson('/transfers?userId=usr-user')->assertOk()->assertJsonPath('0.userId', 'usr-user');
    $this->getJson('/verifications?userId=usr-user')->assertOk()->assertJsonPath('0.userId', 'usr-user');
    $this->getJson('/notifications?userId=usr-user')->assertOk()->assertJsonPath('0.userId', 'usr-user');
});
