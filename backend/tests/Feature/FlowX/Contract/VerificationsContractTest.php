<?php

it('serves verification collection create and patch contract', function (): void {
    $this->getJson('/verifications')->assertOk()->assertJsonIsArray();
    $this->getJson('/verifications?userId=usr-user')->assertOk()->assertJsonPath('0.userId', 'usr-user');

    $verification = $this->postJson('/verifications', ['id' => 'ver-new', 'userId' => 'usr-user'])->assertCreated()->json();
    $this->patchJson('/verifications/'.$verification['id'], ['status' => 'NEEDS_INFO'])->assertOk()->assertJsonPath('status', 'NEEDS_INFO');
});
