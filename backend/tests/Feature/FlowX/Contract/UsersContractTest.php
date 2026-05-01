<?php

it('serves user collection filters and item reads in FlowX shape', function (): void {
    $this->getJson('/users')->assertOk()->assertJsonIsArray()->assertJsonPath('0.id', 'usr-admin');

    $this->getJson('/users?email=user%40flowx.demo&password=user123')
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonPath('0.id', 'usr-user')
        ->assertJsonPath('0.role', 'USER');

    $this->getJson('/users?email=none%40flowx.demo')->assertOk()->assertExactJson([]);
    $this->getJson('/users/usr-user')->assertOk()->assertJsonPath('email', 'user@flowx.demo');
});

it('creates and partially updates users', function (): void {
    $created = $this->postJson('/users', [
        'fullName' => 'New FlowX User',
        'email' => 'new@flowx.demo',
        'password' => 'secret',
    ])->assertCreated()
        ->assertJsonPath('email', 'new@flowx.demo')
        ->assertJsonPath('role', 'USER')
        ->json();

    $this->patchJson('/users/'.$created['id'], ['status' => 'active'])
        ->assertOk()
        ->assertJsonPath('status', 'active')
        ->assertJsonPath('fullName', 'New FlowX User');
});
