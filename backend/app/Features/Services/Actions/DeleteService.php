<?php

declare(strict_types=1);

namespace App\Features\Services\Actions;

use App\Features\Services\Models\Service;

final class DeleteService
{
    public function execute(Service $service): void
    {
        $service->delete();
    }
}
