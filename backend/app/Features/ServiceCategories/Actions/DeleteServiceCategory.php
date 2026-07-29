<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Actions;

use App\Features\ServiceCategories\Models\ServiceCategory;

final class DeleteServiceCategory
{
    public function execute(ServiceCategory $category): void
    {
        $category->delete();
    }
}
