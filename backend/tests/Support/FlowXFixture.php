<?php

namespace Tests\Support;

final class FlowXFixture
{
    /**
     * @return array<string, mixed>
     */
    public static function data(): array
    {
        $path = base_path('tests/Fixtures/FlowX/db.json');
        $decoded = json_decode((string) file_get_contents($path), true);

        unset($decoded['$schema']);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function collection(string $resource): array
    {
        $rows = self::data()[$resource] ?? [];

        return is_array($rows) && array_is_list($rows) ? $rows : [];
    }
}
