<?php

declare(strict_types=1);

namespace App\Features\Services\Actions;

use App\Features\Services\DTOs\UpdateServiceData;
use App\Features\Services\Models\Service;

final class UpdateService
{
    public function execute(Service $service, UpdateServiceData $data): Service
    {
        $attributes = $data->attributes();

        foreach ([
            'category_id',
            'title',
            'slug',
            'description',
            'duration_minutes',
            'price',
            'currency',
        ] as $field) {
            if (array_key_exists($field, $attributes)) {
                $service->{$field} = $attributes[$field];
            }
        }

        $service->save();

        return $service->refresh()->load('category');
    }
}
