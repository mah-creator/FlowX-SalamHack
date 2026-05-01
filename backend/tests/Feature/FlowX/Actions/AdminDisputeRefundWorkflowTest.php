<?php

it('resolves disputes and refunds transfers with audit entries', function (): void {
    $this->patchJson('/disputes/dsp-1001', ['status' => 'RESOLVED', 'resolution' => 'Refunded'])->assertOk()->assertJsonPath('status', 'RESOLVED');
    $this->getJson('/auditLogs')->assertOk()->assertJsonFragment(['action' => 'RESOLVE_DISPUTE']);

    $transfer = $this->postJson('/transfers', ['id' => 'tr-refund', 'status' => 'AWAITING_DEPOSIT'])->json();
    $this->postJson('/transfers/'.$transfer['id'].'/refund', ['reason' => 'Admin refund'])->assertOk()->assertJsonPath('status', 'REFUNDED');
    $this->getJson('/auditLogs')->assertOk()->assertJsonFragment(['action' => 'REFUND_TRANSFER']);
});
