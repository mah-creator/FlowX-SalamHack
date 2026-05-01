<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flowx_wallets', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('user_id')->index();
            $table->decimal('balance', 14, 2)->default(0);
            $table->string('currency', 8)->default('USD');
            $table->decimal('escrow_balance', 14, 2)->default(0);
            $table->decimal('available_balance', 14, 2)->default(0);
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('flowx_users')->cascadeOnDelete();
        });

        Schema::create('flowx_verifications', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('user_id')->index();
            $table->string('status')->default('PENDING')->index();
            $table->string('level')->default('Basic');
            $table->string('document_type')->default('passport');
            $table->string('submitted_at_value');
            $table->string('reviewed_at_value')->nullable();
            $table->string('reviewer_id')->nullable()->index();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('flowx_users')->cascadeOnDelete();
            $table->foreign('reviewer_id')->references('id')->on('flowx_users')->nullOnDelete();
        });

        Schema::create('flowx_disputes', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('transfer_id')->index();
            $table->string('user_id')->index();
            $table->text('reason')->nullable();
            $table->text('evidence')->nullable();
            $table->string('status')->default('OPEN')->index();
            $table->text('resolution')->nullable();
            $table->string('created_at_value');
            $table->string('resolved_at_value')->nullable();
            $table->timestamps();
            $table->foreign('transfer_id')->references('id')->on('flowx_transfers')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('flowx_users')->cascadeOnDelete();
        });

        Schema::create('flowx_notifications', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('user_id')->index();
            $table->string('title')->default('');
            $table->text('message')->nullable();
            $table->boolean('read')->default(false);
            $table->string('type')->default('system')->index();
            $table->string('created_at_value');
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('flowx_users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flowx_notifications');
        Schema::dropIfExists('flowx_disputes');
        Schema::dropIfExists('flowx_verifications');
        Schema::dropIfExists('flowx_wallets');
    }
};
