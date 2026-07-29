<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Controllers;

use App\Features\ServiceCategories\Actions\CreateServiceCategory;
use App\Features\ServiceCategories\Actions\DeleteServiceCategory;
use App\Features\ServiceCategories\Actions\RestoreServiceCategory;
use App\Features\ServiceCategories\Actions\UpdateServiceCategory;
use App\Features\ServiceCategories\Actions\UpdateServiceCategoryStatus;
use App\Features\ServiceCategories\DTOs\CreateServiceCategoryData;
use App\Features\ServiceCategories\DTOs\UpdateServiceCategoryData;
use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\ServiceCategories\Requests\AdminIndexServiceCategoryRequest;
use App\Features\ServiceCategories\Requests\StoreServiceCategoryRequest;
use App\Features\ServiceCategories\Requests\UpdateServiceCategoryRequest;
use App\Features\ServiceCategories\Requests\UpdateServiceCategoryStatusRequest;
use App\Features\ServiceCategories\Resources\ServiceCategoryResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

final class AdminServiceCategoryController
{
    public function index(AdminIndexServiceCategoryRequest $request): JsonResponse
    {
        $isActive = $request->has('is_active')
            ? $request->boolean('is_active')
            : null;

        $paginator = ServiceCategory::query()
            ->search($request->validated('search'))
            ->filterActive($isActive)
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->orderBy('id', $request->sortDirection())
            ->paginate($request->perPage())
            ->withQueryString();

        return ApiResponse::success(
            data: ServiceCategoryResource::collection($paginator->items())->resolve(),
            message: __('service_categories.list_retrieved'),
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function store(
        StoreServiceCategoryRequest $request,
        CreateServiceCategory $createServiceCategory,
    ): JsonResponse {
        $category = $createServiceCategory->execute(
            CreateServiceCategoryData::fromValidated($request->validated()),
        );

        return ApiResponse::created(
            data: (new ServiceCategoryResource($category))->resolve(),
            message: __('service_categories.created'),
        );
    }

    public function show(ServiceCategory $serviceCategory): JsonResponse
    {
        Gate::authorize('view', $serviceCategory);

        return ApiResponse::success(
            data: (new ServiceCategoryResource($serviceCategory))->resolve(),
            message: __('service_categories.details_retrieved'),
        );
    }

    public function update(
        UpdateServiceCategoryRequest $request,
        ServiceCategory $serviceCategory,
        UpdateServiceCategory $updateServiceCategory,
    ): JsonResponse {
        $category = $updateServiceCategory->execute(
            $serviceCategory,
            UpdateServiceCategoryData::fromValidated($request->validated()),
        );

        return ApiResponse::success(
            data: (new ServiceCategoryResource($category))->resolve(),
            message: __('service_categories.updated'),
        );
    }

    public function updateStatus(
        UpdateServiceCategoryStatusRequest $request,
        ServiceCategory $serviceCategory,
        UpdateServiceCategoryStatus $updateServiceCategoryStatus,
    ): JsonResponse {
        $isActive = $request->boolean('is_active');

        $category = $updateServiceCategoryStatus->execute($serviceCategory, $isActive);

        return ApiResponse::success(
            data: (new ServiceCategoryResource($category))->resolve(),
            message: $isActive
                ? __('service_categories.activated')
                : __('service_categories.deactivated'),
        );
    }

    public function destroy(
        ServiceCategory $serviceCategory,
        DeleteServiceCategory $deleteServiceCategory,
    ): JsonResponse {
        Gate::authorize('delete', $serviceCategory);

        $deleteServiceCategory->execute($serviceCategory);

        return ApiResponse::success(
            message: __('service_categories.deleted'),
        );
    }

    public function restore(
        int $id,
        RestoreServiceCategory $restoreServiceCategory,
    ): JsonResponse {
        $category = ServiceCategory::onlyTrashed()->find($id);

        if ($category === null) {
            abort(404);
        }

        Gate::authorize('restore', $category);

        $restored = $restoreServiceCategory->execute($category);

        return ApiResponse::success(
            data: (new ServiceCategoryResource($restored))->resolve(),
            message: __('service_categories.restored'),
        );
    }
}
