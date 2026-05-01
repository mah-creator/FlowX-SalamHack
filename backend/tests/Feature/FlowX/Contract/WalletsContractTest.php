<?php

it('serves wallet collection create and patch contract', function (): void {
    $this->getJson('/wallets')->assertOk()->assertJsonIsArray();
    $this->getJson('/wallets?userId=usr-user')->assertOk()->assertJsonPath('0.availableBalance', 12100.45);

    $wallet = $this->postJson('/wallets', ['id' => 'wal-new', 'userId' => 'usr-user'])->assertCreated()->json();
    $this->patchJson('/wallets/'.$wallet['id'], ['availableBalance' => 50])->assertOk()->assertJsonPath('availableBalance', 50);
});
