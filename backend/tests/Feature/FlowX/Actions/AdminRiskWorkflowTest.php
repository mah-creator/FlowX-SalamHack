<?php

it('processes risk review actions and appends audit logs', function (): void {
    $this->postJson('/transfers/tr-1002/risk-approval')->assertOk()->assertJsonPath('status', 'BOTH_DEPOSITS_CONFIRMED');
    $this->getJson('/auditLogs')->assertOk()->assertJsonFragment(['action' => 'APPROVE_RISK_REVIEW']);

    $transfer = $this->postJson('/transfers', ['id' => 'tr-risk', 'status' => 'UNDER_REVIEW'])->json();
    $this->postJson('/transfers/'.$transfer['id'].'/risk-rejection', ['reason' => 'Too risky'])->assertOk()->assertJsonPath('status', 'FAILED');
    $this->getJson('/auditLogs')->assertOk()->assertJsonFragment(['action' => 'REJECT_RISK_REVIEW']);
});
