<?php

declare(strict_types=1);

namespace App\Features\Services\Actions;

use App\Features\Services\Models\Service;

final class UpdateServiceStatus
{
    public function execute(Service $service, bool $isActive): Service
    {
        $service->is_active = $isActive;
        $service->save();

        return $service->refresh()->load('category');
    }
}
