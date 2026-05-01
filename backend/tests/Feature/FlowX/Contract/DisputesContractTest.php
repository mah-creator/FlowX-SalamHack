<?php

it('creates filters and resolves disputes', function (): void {
    $dispute = $this->postJson('/disputes', [
        'id' => 'dsp-new',
        'transferId' => 'tr-1001',
        'userId' => 'usr-user',
        'reason' => 'Need help',
        'evidence' => 'receipt',
    ])->assertCreated()->assertJsonPath('status', 'OPEN')->json();

    $this->getJson('/disputes')->assertOk()->assertJsonFragment(['id' => 'dsp-new']);
    $this->getJson('/disputes?userId=usr-user')->assertOk()->assertJsonFragment(['id' => 'dsp-new']);
    $this->patchJson('/disputes/'.$dispute['id'], ['status' => 'RESOLVED', 'resolution' => 'Done'])->assertOk()->assertJsonPath('status', 'RESOLVED');
});
