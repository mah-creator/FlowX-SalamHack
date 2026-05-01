<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flowx_configurations', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->decimal('fee_percent', 8, 2)->default(2);
            $table->decimal('exchange_rate', 14, 6)->default(1);
            $table->json('supported_countries')->nullable();
            $table->json('supported_currencies')->nullable();
            $table->json('supported_corridors')->nullable();
            $table->unsignedInteger('payment_window_minutes')->default(30);
            $table->timestamps();
        });

        Schema::create('flowx_audit_logs', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('actor_id')->nullable()->index();
            $table->string('actor_role')->default('ADMIN');
            $table->string('action')->index();
            $table->string('entity_type')->index();
            $table->string('entity_id')->index();
            $table->string('created_at_value');
            $table->timestamps();
        });

        Schema::create('flowx_agents', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('user_id')->nullable()->index();
            $table->string('name');
            $table->string('region')->default('');
            $table->string('status')->default('Available');
            $table->decimal('capacity', 14, 2)->default(0);
            $table->boolean('verified')->default(false);
            $table->timestamps();
        });

        Schema::create('flowx_payment_methods', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('label');
            $table->timestamps();
        });

        Schema::create('flowx_analytics', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('label');
            $table->decimal('value', 14, 2)->default(0);
            $table->decimal('change', 8, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('flowx_activities', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('created_at_value');
            $table->string('type')->default('system')->index();
            $table->timestamps();
        });

        Schema::create('flowx_requests', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flowx_requests');
        Schema::dropIfExists('flowx_activities');
        Schema::dropIfExists('flowx_analytics');
        Schema::dropIfExists('flowx_payment_methods');
        Schema::dropIfExists('flowx_agents');
        Schema::dropIfExists('flowx_audit_logs');
        Schema::dropIfExists('flowx_configurations');
    }
};
