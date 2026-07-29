<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Actions;

use App\Features\ServiceCategories\DTOs\UpdateServiceCategoryData;
use App\Features\ServiceCategories\Models\ServiceCategory;

final class UpdateServiceCategory
{
    public function execute(ServiceCategory $category, UpdateServiceCategoryData $data): ServiceCategory
    {
        $attributes = $data->attributes();

        if (array_key_exists('name', $attributes)) {
            $category->name = $attributes['name'];
        }

        if (array_key_exists('slug', $attributes)) {
            $category->slug = $attributes['slug'];
        }

        if (array_key_exists('description', $attributes)) {
            $category->description = $attributes['description'];
        }

        $category->save();

        return $category->refresh();
    }
}
