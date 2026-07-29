<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Actions;

use App\Features\ServiceCategories\DTOs\CreateServiceCategoryData;
use App\Features\ServiceCategories\Models\ServiceCategory;

final class CreateServiceCategory
{
    public function execute(CreateServiceCategoryData $data): ServiceCategory
    {
        $category = new ServiceCategory;
        $category->name = $data->name;
        $category->slug = $data->slug;
        $category->description = $data->description;
        $category->is_active = $data->isActive;
        $category->save();

        return $category;
    }
}
