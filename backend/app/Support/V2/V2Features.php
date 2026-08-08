<?php

declare(strict_types=1);

namespace App\Support\V2;

use App\Enums\V2Module;

final class V2Features
{
    public static function enabled(V2Module $module): bool
    {
        if (! (bool) config('v2.enabled', false)) {
            return false;
        }

        return (bool) config(
            "v2.modules.{$module->value}.enabled",
            false
        );
    }

    public static function status(V2Module $module): string
    {
        return (string) config(
            "v2.modules.{$module->value}.status",
            'proposed'
        );
    }
}
