<?php

declare(strict_types=1);

namespace Tests\Feature\V2;

use App\Enums\V2Module;
use App\Support\V2\V2Features;
use Tests\TestCase;

class V2FeatureFlagsTest extends TestCase
{
    public function test_master_switch_blocks_enabled_module(): void
    {
        config([
            'v2.enabled' => false,
            'v2.modules.payments.enabled' => true,
        ]);

        $this->assertFalse(
            V2Features::enabled(V2Module::Payments)
        );
    }

    public function test_module_remains_disabled_when_master_is_enabled_but_module_is_disabled(): void
    {
        config([
            'v2.enabled' => true,
            'v2.modules.payments.enabled' => false,
        ]);

        $this->assertFalse(
            V2Features::enabled(V2Module::Payments)
        );
    }

    public function test_module_is_enabled_only_when_master_and_module_are_enabled(): void
    {
        config([
            'v2.enabled' => true,
            'v2.modules.payments.enabled' => true,
        ]);

        $this->assertTrue(
            V2Features::enabled(V2Module::Payments)
        );
    }

    public function test_module_status_can_be_read_centrally(): void
    {
        $this->assertSame(
            'foundation',
            V2Features::status(V2Module::Payments)
        );

        $this->assertSame(
            'proposed',
            V2Features::status(V2Module::Crm)
        );
    }

    public function test_enum_and_configuration_module_registry_remain_in_sync(): void
    {
        $enumModules = array_map(
            static fn (V2Module $module): string => $module->value,
            V2Module::cases()
        );

        $configuredModules = array_keys(
            config('v2.modules', [])
        );

        sort($enumModules);
        sort($configuredModules);

        $this->assertSame(
            $enumModules,
            $configuredModules
        );
    }
}
