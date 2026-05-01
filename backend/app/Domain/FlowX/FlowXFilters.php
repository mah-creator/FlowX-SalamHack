<?php

namespace App\Domain\FlowX;

final class FlowXFilters
{
    /**
     * @param  list<array<string, mixed>>  $rows
     * @param  array<string, mixed>  $filters
     * @return list<array<string, mixed>>
     */
    public function exact(array $rows, array $filters): array
    {
        $active = array_filter(
            $filters,
            static fn (mixed $value): bool => $value !== null && $value !== ''
        );

        if ($active === []) {
            return array_values($rows);
        }

        return array_values(array_filter($rows, static function (array $row) use ($active): bool {
            foreach ($active as $field => $expected) {
                if (! array_key_exists($field, $row) || (string) $row[$field] !== (string) $expected) {
                    return false;
                }
            }

            return true;
        }));
    }
}
