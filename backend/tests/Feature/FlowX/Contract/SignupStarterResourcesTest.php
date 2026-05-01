<?php

it('supports frontend signup starter resource creation', function (): void {
    $user = $this->postJson('/users', [
        'id' => 'usr-signup',
        'fullName' => 'Signup User',
        'email' => 'signup@flowx.demo',
        'password' => 'secret',
    ])->assertCreated()->json();

    $this->postJson('/wallets', ['id' => 'wal-signup', 'userId' => $user['id']])->assertCreated()->assertJsonPath('userId', 'usr-signup');
    $this->postJson('/verifications', ['id' => 'ver-signup', 'userId' => $user['id']])->assertCreated()->assertJsonPath('status', 'PENDING');
    $this->postJson('/notifications', ['id' => 'not-signup', 'userId' => $user['id'], 'title' => 'Account created'])->assertCreated()->assertJsonPath('read', false);
});
