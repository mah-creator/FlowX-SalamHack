<?php

use Illuminate\Support\Facades\Schema;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('creates all FlowX persistence tables with key columns', function (): void {
    $expected = [
        'flowx_users' => ['id', 'email', 'role', 'status', 'created_at_value'],
        'flowx_transfers' => ['id', 'user_id', 'reference_number', 'status', 'payment_confirmation_requested'],
        'flowx_wallets' => ['id', 'user_id', 'balance', 'available_balance'],
        'flowx_verifications' => ['id', 'user_id', 'status', 'reviewer_id'],
        'flowx_disputes' => ['id', 'transfer_id', 'user_id', 'status'],
        'flowx_notifications' => ['id', 'user_id', 'read'],
        'flowx_configurations' => ['id', 'fee_percent', 'supported_countries'],
        'flowx_audit_logs' => ['id', 'actor_id', 'entity_type', 'entity_id'],
        'flowx_agents' => ['id', 'user_id', 'name', 'verified'],
        'flowx_payment_methods' => ['id', 'label'],
        'flowx_analytics' => ['id', 'label', 'value'],
        'flowx_activities' => ['id', 'title', 'created_at_value'],
        'flowx_requests' => ['id', 'payload'],
    ];

    foreach ($expected as $table => $columns) {
        expect(Schema::hasTable($table))->toBeTrue("Missing table {$table}");
        foreach ($columns as $column) {
            expect(Schema::hasColumn($table, $column))->toBeTrue("Missing {$table}.{$column}");
        }
    }
});
