<?php

namespace Database\Seeders;

use App\Domain\FlowX\FlowXFactory;
use App\Domain\FlowX\FlowXPayloadMapper;
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
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class FlowXBaselineSeeder extends Seeder
{
    public function __construct(private readonly FlowXPayloadMapper $mapper) {}

    public function run(): void
    {
        $data = $this->fixture();

        $this->seedCollection('users', FlowXUser::class, $data['users'] ?? []);
        $this->seedCollection('transfers', FlowXTransfer::class, $data['transfers'] ?? []);
        $this->seedCollection('wallets', FlowXWallet::class, $data['wallets'] ?? []);
        $this->seedCollection('verifications', FlowXVerification::class, $data['verifications'] ?? []);
        $this->seedCollection('disputes', FlowXDispute::class, $data['disputes'] ?? []);
        $this->seedCollection('notifications', FlowXNotification::class, $data['notifications'] ?? []);
        $this->seedCollection('auditLogs', FlowXAuditLog::class, $data['auditLogs'] ?? []);
        $this->seedConfig($data['config'] ?? []);
        $this->seedCollection('agents', FlowXAgent::class, $data['agents'] ?? []);
        $this->seedCollection('paymentMethods', FlowXPaymentMethod::class, $data['paymentMethods'] ?? []);
        $this->seedCollection('analytics', FlowXAnalyticsMetric::class, $data['analytics'] ?? []);
        $this->seedCollection('activities', FlowXActivity::class, $data['activities'] ?? []);
        $this->seedRequests($data['requests'] ?? []);
    }

    /**
     * @return array<string, mixed>
     */
    private function fixture(): array
    {
        $path = base_path('tests/Fixtures/FlowX/db.json');
        $decoded = json_decode((string) file_get_contents($path), true);

        unset($decoded['$schema']);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @param  class-string<Model>  $model
     * @param  list<array<string, mixed>>  $rows
     */
    private function seedCollection(string $resource, string $model, array $rows): void
    {
        foreach ($rows as $row) {
            if (! is_array($row) || ! isset($row['id'])) {
                continue;
            }

            $model::query()->firstOrCreate(
                ['id' => (string) $row['id']],
                $this->mapper->toDatabase($resource, $row),
            );
        }
    }

    /**
     * @param  array<string, mixed>  $config
     */
    private function seedConfig(array $config): void
    {
        if ($config === []) {
            $config = [
                'id' => 'main',
                'feePercent' => 2,
                'exchangeRate' => 1,
                'supportedCountries' => [],
                'supportedCurrencies' => [],
                'supportedCorridors' => [],
                'paymentWindowMinutes' => 30,
            ];
        }

        FlowXConfiguration::query()->firstOrCreate(
            ['id' => (string) ($config['id'] ?? 'main')],
            $this->mapper->toDatabase('config', $config),
        );
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     */
    private function seedRequests(array $rows): void
    {
        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $id = (string) ($row['id'] ?? app(FlowXFactory::class)->id('req'));
            FlowXRequest::query()->firstOrCreate(['id' => $id], ['payload' => $row]);
        }
    }
}
