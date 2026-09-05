<?php

declare(strict_types=1);

namespace Tests\Support;

use Illuminate\Support\Env;
use ReflectionClass;

/**
 * Overrides a FEATURE_*_ENABLED environment variable for a single test.
 *
 * Laravel/phpdotenv memoize their environment repository in a static
 * property for the lifetime of the PHP process. Once any test has booted
 * the application, a later test's putenv()/$_ENV override is silently
 * discarded when the next application boot reloads .env into that same
 * memoized, immutable repository. Resetting the repository before boot
 * forces it to be rebuilt from the current (overridden) process
 * environment, so the override actually takes effect regardless of
 * which test ran first in the process.
 */
trait InteractsWithFeatureFlags
{
    protected function setFeatureFlagEnv(string $key, string $value): void
    {
        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;

        $repository = (new ReflectionClass(Env::class))->getProperty('repository');
        $repository->setAccessible(true);
        $repository->setValue(null, null);
    }

    protected function restoreFeatureFlagEnv(string $key, ?string $previousValue): void
    {
        if ($previousValue === null) {
            putenv($key);
            unset($_ENV[$key], $_SERVER[$key]);
        } else {
            putenv("{$key}={$previousValue}");
            $_ENV[$key] = $previousValue;
            $_SERVER[$key] = $previousValue;
        }

        $repository = (new ReflectionClass(Env::class))->getProperty('repository');
        $repository->setAccessible(true);
        $repository->setValue(null, null);
    }
}
