<?php

it('submits pending or matched transfers and rejects terminal transfers', function (): void {
    $transfer = $this->postJson('/transfers', ['id' => 'tr-submit', 'userId' => 'usr-user', 'amount' => 100])->json();
    $this->postJson('/transfers/'.$transfer['id'].'/submit')->assertOk()->assertJsonPath('status', 'AWAITING_DEPOSIT');

    $completed = $this->postJson('/transfers', ['id' => 'tr-complete', 'status' => 'COMPLETED'])->json();
    $this->postJson('/transfers/'.$completed['id'].'/submit')->assertStatus(409);
});
