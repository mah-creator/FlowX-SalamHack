<?php

it('serves notification collection create and mark read contract', function (): void {
    $this->getJson('/notifications')->assertOk()->assertJsonIsArray();
    $this->getJson('/notifications?userId=usr-user')->assertOk()->assertJsonPath('0.userId', 'usr-user');

    $notification = $this->postJson('/notifications', ['id' => 'not-new', 'userId' => 'usr-user', 'title' => 'Hi'])->assertCreated()->json();
    $this->patchJson('/notifications/'.$notification['id'], ['read' => true])->assertOk()->assertJsonPath('read', true);
});
