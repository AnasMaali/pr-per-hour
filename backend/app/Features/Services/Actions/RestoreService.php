<?php

declare(strict_types=1);

namespace App\Features\Services\Actions;

use App\Features\Services\Models\Service;

final class RestoreService
{
    public function execute(Service $service): Service
    {
        $service->restore();

        return $service->refresh()->load('category');
    }
}
