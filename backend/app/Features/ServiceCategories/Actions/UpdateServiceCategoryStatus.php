<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Actions;

use App\Features\ServiceCategories\Models\ServiceCategory;

final class UpdateServiceCategoryStatus
{
    public function execute(ServiceCategory $category, bool $isActive): ServiceCategory
    {
        $category->is_active = $isActive;
        $category->save();

        return $category->refresh();
    }
}
