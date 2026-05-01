<?php

it('returns predictable errors for missing resources and invalid transitions', function (): void {
    $this->getJson('/users/nope')->assertNotFound()->assertJsonPath('error.code', 'not_found');
    $this->patchJson('/wallets/nope', ['balance' => 1])->assertNotFound()->assertJsonPath('error.code', 'not_found');
    $this->postJson('/transfers/tr-1001/refund')->assertStatus(409)->assertJsonPath('error.code', 'invalid_state');
});
