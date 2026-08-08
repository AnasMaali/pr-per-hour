<?php

declare(strict_types=1);

namespace Tests\Feature\V2;

use Tests\TestCase;

class V2FoundationTest extends TestCase
{
    public function test_v2_is_disabled_by_default(): void
    {
        $this->assertFalse(config('v2.enabled'));
    }

    public function test_all_v2_modules_are_disabled_by_default(): void
    {
        $modules = config('v2.modules');

        $this->assertIsArray($modules);
        $this->assertNotEmpty($modules);

        foreach ($modules as $name => $module) {
            $this->assertArrayHasKey(
                'enabled',
                $module,
                "V2 module [{$name}] must define an enabled flag."
            );

            $this->assertFalse(
                $module['enabled'],
                "V2 module [{$name}] must be disabled by default."
            );
        }
    }

    public function test_existing_future_ready_modules_are_marked_as_foundation(): void
    {
        $this->assertSame(
            'foundation',
            config('v2.modules.payments.status')
        );

        $this->assertSame(
            'foundation',
            config('v2.modules.invoices.status')
        );
    }

    public function test_advanced_scheduling_is_in_development(): void
    {
        $this->assertSame(
            'development',
            config('v2.modules.advanced_scheduling.status')
        );

        $this->assertFalse(
            config('v2.modules.advanced_scheduling.enabled')
        );
    }

    public function test_unapproved_modules_remain_proposed(): void
    {
        $proposedModules = [
            'consultants',
            'roles_permissions',
            'crm',
            'leads',
            'coupons',
            'advanced_chatbot',
            'knowledge_base',
            'analytics',
            'cms',
            'blog',
            'notifications',
        ];

        foreach ($proposedModules as $module) {
            $this->assertSame(
                'proposed',
                config("v2.modules.{$module}.status"),
                "V2 module [{$module}] should remain proposed."
            );
        }
    }
}
