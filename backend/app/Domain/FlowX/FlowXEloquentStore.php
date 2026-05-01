<?php

namespace App\Domain\FlowX;

use App\Models\FlowXActivity;
use App\Models\FlowXAgent;
use App\Models\FlowXAnalyticsMetric;
use App\Models\FlowXAuditLog;
use App\Models\FlowXConfiguration;
use App\Models\FlowXDispute;
use App\Models\FlowXNotification;
use App\Models\FlowXPaymentMethod;
use App\Models\FlowXRequest;
use App\Models\FlowXTransfer;
use App\Models\FlowXUser;
use App\Models\FlowXVerification;
use App\Models\FlowXWallet;
use Database\Seeders\FlowXBaselineSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;

final class FlowXEloquentStore
{
    public function __construct(
        private readonly FlowXFactory $factory,
        private readonly FlowXPayloadMapper $mapper,
    ) {}

    /**
     * @return array<string, class-string<Model>>
     */
    private function models(): array
    {
        return [
            'users' => FlowXUser::class,
            'transfers' => FlowXTransfer::class,
            'wallets' => FlowXWallet::class,
            'verifications' => FlowXVerification::class,
            'disputes' => FlowXDispute::class,
            'notifications' => FlowXNotification::class,
            'auditLogs' => FlowXAuditLog::class,
            'agents' => FlowXAgent::class,
            'paymentMethods' => FlowXPaymentMethod::class,
            'analytics' => FlowXAnalyticsMetric::class,
            'activities' => FlowXActivity::class,
            'requests' => FlowXRequest::class,
        ];
    }

    public function reset(): void
    {
        DB::transaction(function (): void {
            foreach ([
                FlowXRequest::class,
                FlowXActivity::class,
                FlowXAnalyticsMetric::class,
                FlowXPaymentMethod::class,
                FlowXAgent::class,
                FlowXAuditLog::class,
                FlowXNotification::class,
                FlowXDispute::class,
                FlowXVerification::class,
                FlowXWallet::class,
                FlowXTransfer::class,
                FlowXConfiguration::class,
                FlowXUser::class,
            ] as $model) {
                $model::query()->delete();
            }
        });
        app(FlowXBaselineSeeder::class)->run();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function all(string $resource, array $filters = []): array
    {
        $model = $this->model($resource);
        $query = $model::query();

        foreach ($this->mapper->filtersToDatabase($resource, $filters) as $column => $value) {
            if ($value !== null && $value !== '') {
                $query->where($column, $value);
            }
        }

        return $query->get()->map(fn (Model $row): array => $row->toFlowXArray())->values()->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    public function find(string $resource, string $id): ?array
    {
        if ($resource === 'config') {
            $config = FlowXConfiguration::query()->find($id);

            return $config?->toFlowXArray();
        }

        $row = $this->model($resource)::query()->find($id);

        return $row?->toFlowXArray();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function create(string $resource, array $payload): array
    {
        if ($resource === 'config') {
            return $this->patchConfig($payload);
        }

        $payload = $this->withMockCompatibleRelationshipDefaults($resource, $this->factory->resource($resource, $payload));
        $this->assertRelationships($resource, $payload);
        $row = $this->model($resource)::query()->create($this->mapper->toDatabase($resource, $payload));

        if ($resource === 'disputes') {
            $this->markTransferDisputed((string) ($payload['transferId'] ?? ''));
        }

        return $row->toFlowXArray();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>|null
     */
    public function patch(string $resource, string $id, array $payload): ?array
    {
        if ($resource === 'config') {
            return $this->patchConfig($payload);
        }

        $row = $this->model($resource)::query()->find($id);
        if ($row === null) {
            return null;
        }

        if ($resource === 'transfers' && ! array_key_exists('updatedAt', $payload)) {
            $payload['updatedAt'] = $this->factory->now();
        }

        if ($resource === 'disputes' && isset($payload['status']) && in_array($payload['status'], ['RESOLVED', 'REJECTED'], true) && ! isset($payload['resolvedAt'])) {
            $payload['resolvedAt'] = $this->factory->now();
        }

        $merged = $this->withMockCompatibleRelationshipDefaults($resource, array_replace($row->toFlowXArray(), $payload));
        $this->assertRelationships($resource, $merged, $id);
        $row->fill($this->mapper->toDatabase($resource, $payload));
        $row->save();

        return $row->refresh()->toFlowXArray();
    }

    /**
     * @param  array<string, mixed>  $row
     */
    public function replace(string $resource, string $id, array $row): void
    {
        $model = $this->model($resource)::query()->find($id);
        if ($model === null) {
            return;
        }

        $this->assertRelationships($resource, $row, $id);
        $model->fill($this->mapper->toDatabase($resource, $row));
        $model->save();
    }

    /**
     * @return array<string, mixed>
     */
    public function config(): array
    {
        $config = FlowXConfiguration::query()->find('main') ?? FlowXConfiguration::query()->first();

        if ($config === null) {
            $config = FlowXConfiguration::query()->create($this->mapper->toDatabase('config', [
                'id' => 'main',
                'feePercent' => 2,
                'exchangeRate' => 1,
                'supportedCountries' => [],
                'supportedCurrencies' => [],
                'supportedCorridors' => [],
                'paymentWindowMinutes' => 30,
            ]));
        }

        return $config->toFlowXArray();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function patchConfig(array $payload): array
    {
        $config = FlowXConfiguration::query()->find('main') ?? FlowXConfiguration::query()->create($this->mapper->toDatabase('config', [
            'id' => 'main',
            'feePercent' => 2,
            'exchangeRate' => 1,
            'supportedCountries' => [],
            'supportedCurrencies' => [],
            'supportedCorridors' => [],
            'paymentWindowMinutes' => 30,
        ]));

        $config->fill($this->mapper->toDatabase('config', $payload));
        $config->save();

        return $config->refresh()->toFlowXArray();
    }

    /**
     * @return class-string<Model>
     */
    private function model(string $resource): string
    {
        $models = $this->models();
        if (! isset($models[$resource])) {
            throw new RuntimeException("Unknown FlowX resource [{$resource}].");
        }

        return $models[$resource];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function assertRelationships(string $resource, array $payload, ?string $id = null): void
    {
        $userId = $payload['userId'] ?? null;
        if (in_array($resource, ['wallets', 'transfers', 'verifications', 'disputes', 'notifications'], true)) {
            if (! is_string($userId) || FlowXUser::query()->whereKey($userId)->doesntExist()) {
                throw new RuntimeException('missing_user');
            }
        }

        $transferId = $payload['transferId'] ?? null;
        if ($resource === 'disputes' && (! is_string($transferId) || FlowXTransfer::query()->whereKey($transferId)->doesntExist())) {
            throw new RuntimeException('missing_transfer');
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function withMockCompatibleRelationshipDefaults(string $resource, array $payload): array
    {
        if (in_array($resource, ['wallets', 'transfers', 'verifications', 'notifications'], true) && (string) ($payload['userId'] ?? '') === '') {
            $payload['userId'] = 'usr-user';
        }

        return $payload;
    }

    private function markTransferDisputed(string $transferId): void
    {
        $transfer = FlowXTransfer::query()->find($transferId);
        if ($transfer !== null && ! FlowXTransferStatus::isTerminal((string) $transfer->status)) {
            $transfer->status = FlowXTransferStatus::DISPUTED;
            $transfer->updated_at_value = $this->factory->now();
            $transfer->save();
        }
    }
}
