<?php

it('matches eligible pending transfer and rejects invalid match state', function (): void {
    $transfer = $this->postJson('/transfers', ['id' => 'tr-match', 'userId' => 'usr-user', 'amount' => 100])->json();

    $this->postJson('/transfers/'.$transfer['id'].'/match-request')->assertOk()->assertJsonPath('status', 'MATCH_FOUND');
    $this->postJson('/transfers/'.$transfer['id'].'/match-request')->assertStatus(409);
});
