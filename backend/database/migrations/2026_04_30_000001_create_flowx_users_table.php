<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flowx_users', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('password')->default('');
            $table->string('role')->default('USER')->index();
            $table->string('account_type')->default('Individual');
            $table->string('country')->default('Gaza');
            $table->string('phone')->default('');
            $table->boolean('verified')->default(false);
            $table->string('kyc_level')->default('Basic');
            $table->string('verification_status')->default('PENDING')->index();
            $table->unsignedSmallInteger('trust_score')->default(70);
            $table->string('status')->default('pending')->index();
            $table->string('created_at_value');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flowx_users');
    }
};
