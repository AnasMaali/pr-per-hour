<?php

declare(strict_types=1);

namespace App\Support\Routing;

/**
 * Explicit map of feature-owned API route files under /api/v1.
 *
 * Future modules remain in the repository, but a disabled feature never
 * registers HTTP endpoints. This prevents hidden UI routes from being called
 * directly while keeping the database and code future-ready.
 */
final class FeatureApiRouteRegistrar
{
    /**
     * @var array<string, array{path: string, enabled: bool}>
     */
    private static function featureRoutes(): array
    {
        return [
            'Auth' => [
                'path' => 'app/Features/Auth/routes/api.php',
                'enabled' => true,
            ],
            'Users' => [
                'path' => 'app/Features/Users/routes/api.php',
                'enabled' => true,
            ],
            'ServiceCategories' => [
                'path' => 'app/Features/ServiceCategories/routes/api.php',
                'enabled' => true,
            ],
            'Services' => [
                'path' => 'app/Features/Services/routes/api.php',
                'enabled' => true,
            ],
            'ContactMessages' => [
                'path' => 'app/Features/ContactMessages/routes/api.php',
                'enabled' => true,
            ],
            'Bookings' => [
                'path' => 'app/Features/Bookings/routes/api.php',
                'enabled' => (bool) config('features.bookings', false),
            ],
        ];
    }

    public static function register(): void
    {
        foreach (self::featureRoutes() as $feature) {
            if (! $feature['enabled']) {
                continue;
            }

            $path = base_path($feature['path']);

            if (is_file($path)) {
                require $path;
            }
        }
    }

    /**
     * @return array<string, string>
     */
    public static function registeredFeatures(): array
    {
        $registered = [];

        foreach (self::featureRoutes() as $name => $feature) {
            if ($feature['enabled']) {
                $registered[$name] = $feature['path'];
            }
        }

        return $registered;
    }
}
