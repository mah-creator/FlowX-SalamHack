<?php

it('records audit entries for admin verification outcomes', function (): void {
    $this->patchJson('/verifications/ver-pending', ['status' => 'VERIFIED', 'reviewerId' => 'usr-admin'])->assertOk()->assertJsonPath('status', 'VERIFIED');
    $this->getJson('/auditLogs')->assertOk()->assertJsonFragment(['action' => 'APPROVE_VERIFICATION']);

    $this->patchJson('/verifications/ver-pending', ['status' => 'NEEDS_INFO', 'reviewerId' => 'usr-admin'])->assertOk();
    $this->getJson('/auditLogs')->assertOk()->assertJsonFragment(['action' => 'REQUEST_VERIFICATION_INFO']);
});
