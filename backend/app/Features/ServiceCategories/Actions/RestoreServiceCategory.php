<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Actions;

use App\Features\ServiceCategories\Models\ServiceCategory;

final class RestoreServiceCategory
{
    public function execute(ServiceCategory $category): ServiceCategory
    {
        $category->restore();

        return $category->refresh();
    }
}
