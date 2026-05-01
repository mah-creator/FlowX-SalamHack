<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('flowx_transfers', function (Blueprint $table): void {
            $table->string('counterparty_transfer_id')->nullable()->index()->after('payment_confirmation_requested');
        });
    }

    public function down(): void
    {
        Schema::table('flowx_transfers', function (Blueprint $table): void {
            $table->dropIndex(['counterparty_transfer_id']);
            $table->dropColumn('counterparty_transfer_id');
        });
    }
};
