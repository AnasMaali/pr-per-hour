<?php

declare(strict_types=1);

namespace App\Features\Services\Actions;

use App\Features\Services\DTOs\CreateServiceData;
use App\Features\Services\Models\Service;

final class CreateService
{
    public function execute(CreateServiceData $data): Service
    {
        $service = new Service;
        $service->category_id = $data->categoryId;
        $service->title = $data->title;
        $service->slug = $data->slug;
        $service->description = $data->description;
        $service->duration_minutes = $data->durationMinutes;
        $service->price = $data->price;
        $service->currency = $data->currency;
        $service->is_active = $data->isActive;
        $service->save();

        return $service->load('category');
    }
}
