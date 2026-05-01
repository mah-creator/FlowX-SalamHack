<?php

namespace App\Domain\FlowX;

use RuntimeException;

final class FlowXStore
{
    /** @var array<string, mixed>|null */
    private ?array $data = null;

    public function __construct(
        private readonly FlowXFactory $factory,
        private readonly FlowXFilters $filters,
    ) {}

    public static function resetGlobal(): void
    {
        $path = self::storagePath();
        if (is_file($path)) {
            unlink($path);
        }
    }

    private function eloquent(): FlowXEloquentStore
    {
        return app(FlowXEloquentStore::class);
    }

    public static function storagePath(): string
    {
        return storage_path('framework/flowx-store.json');
    }

    public function reset(): void
    {
        $this->eloquent()->reset();
        $this->data = null;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function all(string $resource, array $filters = []): array
    {
        return $this->eloquent()->all($resource, $filters);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function find(string $resource, string $id): ?array
    {
        return $this->eloquent()->find($resource, $id);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function create(string $resource, array $payload): array
    {
        return $this->eloquent()->create($resource, $payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>|null
     */
    public function patch(string $resource, string $id, array $payload): ?array
    {
        return $this->eloquent()->patch($resource, $id, $payload);
    }

    /**
     * @param  array<string, mixed>  $row
     */
    public function replace(string $resource, string $id, array $row): void
    {
        $this->eloquent()->replace($resource, $id, $row);
    }

    /**
     * @return array<string, mixed>
     */
    public function config(): array
    {
        return $this->eloquent()->config();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function patchConfig(array $payload): array
    {
        return $this->eloquent()->patchConfig($payload);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function collection(string $resource): array
    {
        $rows = $this->getData()[$resource] ?? [];

        return is_array($rows) && array_is_list($rows) ? array_values(array_filter($rows, 'is_array')) : [];
    }

    /**
     * @return array<string, mixed>
     */
    private function getData(): array
    {
        if ($this->data !== null) {
            return $this->data;
        }

        $path = self::storagePath();
        if (is_file($path)) {
            $decoded = json_decode((string) file_get_contents($path), true);
            if (is_array($decoded)) {
                return $this->data = $decoded;
            }
        }

        $this->data = $this->seedData();
        $this->persist();

        return $this->data;
    }

    /**
     * @return array<string, mixed>
     */
    private function seedData(): array
    {
        $paths = [
            base_path('tests/Fixtures/FlowX/db.json'),
            dirname(base_path()).DIRECTORY_SEPARATOR.'updated_frontend'.DIRECTORY_SEPARATOR.'db.json',
        ];

        foreach ($paths as $path) {
            if (is_file($path)) {
                $decoded = json_decode((string) file_get_contents($path), true);
                if (is_array($decoded)) {
                    unset($decoded['$schema']);

                    return $decoded;
                }
            }
        }

        throw new RuntimeException('FlowX seed fixture was not found.');
    }

    private function persist(): void
    {
        $path = self::storagePath();
        $dir = dirname($path);
        if (! is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        file_put_contents($path, json_encode($this->data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}
