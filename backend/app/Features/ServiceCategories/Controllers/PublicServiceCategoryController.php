<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Controllers;

use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\ServiceCategories\Resources\ServiceCategoryResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;

final class PublicServiceCategoryController
{
    public function index(): JsonResponse
    {
        $categories = ServiceCategory::query()
            ->active()
            ->orderBy('id')
            ->get();

        return ApiResponse::success(
            data: ServiceCategoryResource::collection($categories)->resolve(),
            message: __('service_categories.list_retrieved'),
        );
    }

    public function show(string $slug): JsonResponse
    {
        $category = ServiceCategory::query()
            ->active()
            ->where('slug', $slug)
            ->first();

        if ($category === null) {
            abort(404);
        }

        return ApiResponse::success(
            data: (new ServiceCategoryResource($category))->resolve(),
            message: __('service_categories.details_retrieved'),
        );
    }
}
