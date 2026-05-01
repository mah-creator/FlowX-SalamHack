<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flowx_transfers', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('user_id')->index();
            $table->string('source_country');
            $table->string('destination_country');
            $table->decimal('amount', 14, 2);
            $table->string('currency', 8)->default('USD');
            $table->decimal('fee', 14, 2)->default(0);
            $table->decimal('exchange_rate', 14, 6)->default(1);
            $table->decimal('net_amount', 14, 2)->default(0);
            $table->string('status')->index();
            $table->string('payment_method')->default('');
            $table->string('receiver_name')->default('');
            $table->string('receiver_payment_method')->default('');
            $table->string('reference_number')->unique();
            $table->string('created_at_value');
            $table->string('updated_at_value');
            $table->string('risk_level')->default('low')->index();
            $table->boolean('payment_confirmation_requested')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('flowx_users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flowx_transfers');
    }
};
