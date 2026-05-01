<?php

use App\Models\FlowXTransfer;
use App\Models\FlowXUser;
use Tests\Concerns\UsesFlowXDatabase;

uses(UsesFlowXDatabase::class);

it('serializes users with exact FlowX frontend field names', function (): void {
    $user = FlowXUser::query()->create([
        'id' => 'usr-serialization',
        'full_name' => 'Serialization User',
        'email' => 'serialization@flowx.demo',
        'password' => 'secret',
        'role' => 'USER',
        'account_type' => 'Individual',
        'country' => 'Gaza',
        'phone' => '+970599999999',
        'verified' => false,
        'kyc_level' => 'Basic',
        'verification_status' => 'PENDING',
        'trust_score' => 70,
        'status' => 'pending',
        'created_at_value' => '2026-04-30T00:00:00.000Z',
    ]);

    expect($user->toFlowXArray())->toMatchArray([
        'id' => 'usr-serialization',
        'fullName' => 'Serialization User',
        'email' => 'serialization@flowx.demo',
        'accountType' => 'Individual',
        'kycLevel' => 'Basic',
        'verificationStatus' => 'PENDING',
        'trustScore' => 70,
        'createdAt' => '2026-04-30T00:00:00.000Z',
    ]);
});

it('serializes transfers with exact FlowX frontend field names', function (): void {
    FlowXUser::query()->create([
        'id' => 'usr-transfer-owner',
        'full_name' => 'Transfer Owner',
        'email' => 'owner@flowx.demo',
        'password' => 'secret',
        'role' => 'USER',
        'account_type' => 'Individual',
        'country' => 'Gaza',
        'phone' => '+970500000000',
        'verified' => true,
        'kyc_level' => 'Verified',
        'verification_status' => 'VERIFIED',
        'trust_score' => 90,
        'status' => 'active',
        'created_at_value' => '2026-04-30T00:00:00.000Z',
    ]);

    $transfer = FlowXTransfer::query()->create([
        'id' => 'tr-serialization',
        'user_id' => 'usr-transfer-owner',
        'source_country' => 'Gaza',
        'destination_country' => 'Egypt',
        'amount' => 100,
        'currency' => 'USD',
        'fee' => 2,
        'exchange_rate' => 1,
        'net_amount' => 98,
        'status' => 'PENDING_REQUEST',
        'payment_method' => 'FlowX Wallet',
        'receiver_name' => 'Receiver',
        'receiver_payment_method' => 'Bank Transfer',
        'reference_number' => 'FX-SERIALIZATION',
        'created_at_value' => '2026-04-30T00:00:00.000Z',
        'updated_at_value' => '2026-04-30T00:00:00.000Z',
        'risk_level' => 'low',
        'payment_confirmation_requested' => false,
    ]);

    expect($transfer->toFlowXArray())->toMatchArray([
        'id' => 'tr-serialization',
        'userId' => 'usr-transfer-owner',
        'sourceCountry' => 'Gaza',
        'destinationCountry' => 'Egypt',
        'exchangeRate' => 1.0,
        'netAmount' => 98.0,
        'paymentMethod' => 'FlowX Wallet',
        'receiverName' => 'Receiver',
        'receiverPaymentMethod' => 'Bank Transfer',
        'referenceNumber' => 'FX-SERIALIZATION',
        'paymentConfirmationRequested' => false,
    ]);
});
