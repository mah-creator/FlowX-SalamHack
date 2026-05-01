<?php

namespace App\Domain\FlowX;

use Illuminate\Support\Str;

final class FlowXFactory
{
    public function now(): string
    {
        return now()->toISOString();
    }

    public function id(string $prefix): string
    {
        return $prefix.'-'.Str::lower(Str::random(10));
    }

    public function referenceNumber(): string
    {
        return 'FX-'.now()->format('YmdHis').'-'.random_int(100, 999);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function user(array $payload): array
    {
        $now = $this->now();
        $email = strtolower(trim((string) ($payload['email'] ?? '')));

        return array_replace([
            'id' => $this->id('usr'),
            'fullName' => 'FlowX User',
            'email' => $email,
            'password' => '',
            'role' => 'USER',
            'accountType' => 'Individual',
            'country' => 'Gaza',
            'phone' => '+970590000000',
            'verified' => false,
            'kycLevel' => 'Basic',
            'verificationStatus' => 'PENDING',
            'trustScore' => 70,
            'status' => 'pending',
            'createdAt' => $now,
        ], $payload, ['email' => $email]);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function transfer(array $payload): array
    {
        $now = $this->now();
        $amount = (float) ($payload['amount'] ?? 0);
        $feePercent = 2.0;
        $fee = array_key_exists('fee', $payload) ? (float) $payload['fee'] : round($amount * ($feePercent / 100), 2);
        $exchangeRate = (float) ($payload['exchangeRate'] ?? 1);

        return array_replace([
            'id' => $this->id('tr'),
            'userId' => '',
            'sourceCountry' => 'Gaza',
            'destinationCountry' => 'Egypt',
            'amount' => $amount,
            'currency' => 'USD',
            'fee' => $fee,
            'exchangeRate' => $exchangeRate,
            'netAmount' => round(($amount - $fee) * $exchangeRate, 2),
            'status' => FlowXTransferStatus::PENDING_REQUEST,
            'paymentMethod' => 'FlowX Wallet',
            'receiverName' => '',
            'receiverPaymentMethod' => 'Bank Transfer',
            'referenceNumber' => $this->referenceNumber(),
            'createdAt' => $now,
            'updatedAt' => $now,
            'riskLevel' => $amount >= 1000 ? 'high' : ($amount >= 500 ? 'medium' : 'low'),
            'paymentConfirmationRequested' => false,
        ], $payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function resource(string $resource, array $payload): array
    {
        $now = $this->now();

        return match ($resource) {
            'users' => $this->user($payload),
            'transfers' => $this->transfer($payload),
            'wallets' => array_replace([
                'id' => $this->id('wal'),
                'userId' => '',
                'balance' => 0,
                'currency' => 'USD',
                'escrowBalance' => 0,
                'availableBalance' => 0,
            ], $payload),
            'verifications' => array_replace([
                'id' => $this->id('ver'),
                'userId' => '',
                'status' => 'PENDING',
                'level' => 'Basic',
                'documentType' => 'passport',
                'submittedAt' => $now,
                'reviewedAt' => null,
                'reviewerId' => null,
                'rejectionReason' => null,
            ], $payload),
            'notifications' => array_replace([
                'id' => $this->id('not'),
                'userId' => '',
                'title' => '',
                'message' => '',
                'read' => false,
                'type' => 'system',
                'createdAt' => $now,
            ], $payload),
            'disputes' => array_replace([
                'id' => $this->id('dsp'),
                'transferId' => '',
                'userId' => '',
                'reason' => '',
                'evidence' => '',
                'status' => 'OPEN',
                'resolution' => null,
                'createdAt' => $now,
                'resolvedAt' => null,
            ], $payload),
            'auditLogs' => array_replace([
                'id' => $this->id('audit'),
                'actorId' => 'system',
                'actorRole' => 'ADMIN',
                'action' => 'SYSTEM_ACTION',
                'entityType' => 'system',
                'entityId' => 'system',
                'createdAt' => $now,
            ], $payload),
            default => array_replace(['id' => $this->id('res')], $payload),
        };
    }
}
