<?php

namespace App\Domain\FlowX;

final class FlowXPayloadMapper
{
    /** @var array<string, array<string, string>> */
    private const MAPS = [
        'users' => [
            'fullName' => 'full_name',
            'accountType' => 'account_type',
            'kycLevel' => 'kyc_level',
            'verificationStatus' => 'verification_status',
            'trustScore' => 'trust_score',
            'createdAt' => 'created_at_value',
        ],
        'transfers' => [
            'userId' => 'user_id',
            'sourceCountry' => 'source_country',
            'destinationCountry' => 'destination_country',
            'exchangeRate' => 'exchange_rate',
            'netAmount' => 'net_amount',
            'paymentMethod' => 'payment_method',
            'receiverName' => 'receiver_name',
            'receiverPaymentMethod' => 'receiver_payment_method',
            'referenceNumber' => 'reference_number',
            'createdAt' => 'created_at_value',
            'updatedAt' => 'updated_at_value',
            'riskLevel' => 'risk_level',
            'paymentConfirmationRequested' => 'payment_confirmation_requested',
            'counterpartyTransferId' => 'counterparty_transfer_id',
        ],
        'wallets' => [
            'userId' => 'user_id',
            'escrowBalance' => 'escrow_balance',
            'availableBalance' => 'available_balance',
        ],
        'verifications' => [
            'userId' => 'user_id',
            'documentType' => 'document_type',
            'submittedAt' => 'submitted_at_value',
            'reviewedAt' => 'reviewed_at_value',
            'reviewerId' => 'reviewer_id',
            'rejectionReason' => 'rejection_reason',
        ],
        'disputes' => [
            'transferId' => 'transfer_id',
            'userId' => 'user_id',
            'createdAt' => 'created_at_value',
            'resolvedAt' => 'resolved_at_value',
        ],
        'notifications' => [
            'userId' => 'user_id',
            'createdAt' => 'created_at_value',
        ],
        'auditLogs' => [
            'actorId' => 'actor_id',
            'actorRole' => 'actor_role',
            'entityType' => 'entity_type',
            'entityId' => 'entity_id',
            'createdAt' => 'created_at_value',
        ],
        'config' => [
            'feePercent' => 'fee_percent',
            'exchangeRate' => 'exchange_rate',
            'supportedCountries' => 'supported_countries',
            'supportedCurrencies' => 'supported_currencies',
            'supportedCorridors' => 'supported_corridors',
            'paymentWindowMinutes' => 'payment_window_minutes',
        ],
        'agents' => ['userId' => 'user_id'],
        'activities' => ['createdAt' => 'created_at_value'],
    ];

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function toDatabase(string $resource, array $payload): array
    {
        $map = self::MAPS[$resource] ?? [];
        $row = [];

        foreach ($payload as $key => $value) {
            $row[$map[$key] ?? $key] = $value;
        }

        return $row;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function filtersToDatabase(string $resource, array $filters): array
    {
        return $this->toDatabase($resource, $filters);
    }
}
