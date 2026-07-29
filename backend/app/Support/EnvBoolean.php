<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Safe environment boolean parsing.
 *
 * PHP cast (bool) "false" is true because non-empty strings are truthy.
 * This helper treats explicit false-like values as false.
 */
final class EnvBoolean
{
    /**
     * @param  list<string>  $truthy
     * @param  list<string>  $falsy
     */
    public static function get(
        string $key,
        bool $default = false,
        array $truthy = ['1', 'true', 'yes', 'on'],
        array $falsy = ['0', 'false', 'no', 'off', ''],
    ): bool {
        $value = env($key);

        if ($value === null) {
            return $default;
        }

        if (is_bool($value)) {
            return $value;
        }

        if (is_int($value) || is_float($value)) {
            return (int) $value === 1;
        }

        if (! is_string($value)) {
            return $default;
        }

        $normalized = strtolower(trim($value));

        if (in_array($normalized, $truthy, true)) {
            return true;
        }

        if (in_array($normalized, $falsy, true)) {
            return false;
        }

        return $default;
    }
}
