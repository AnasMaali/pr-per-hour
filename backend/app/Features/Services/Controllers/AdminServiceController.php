<?php

declare(strict_types=1);

namespace App\Features\Services\Controllers;

use App\Features\ServiceCategories\Models\ServiceCategory;
use App\Features\Services\Actions\CreateService;
use App\Features\Services\Actions\DeleteService;
use App\Features\Services\Actions\RestoreService;
use App\Features\Services\Actions\UpdateService;
use App\Features\Services\Actions\UpdateServiceStatus;
use App\Features\Services\DTOs\CreateServiceData;
use App\Features\Services\DTOs\UpdateServiceData;
use App\Features\Services\Models\Service;
use App\Features\Services\Requests\AdminServiceIndexRequest;
use App\Features\Services\Requests\StoreServiceRequest;
use App\Features\Services\Requests\UpdateServiceRequest;
use App\Features\Services\Requests\UpdateServiceStatusRequest;
use App\Features\Services\Resources\ServiceResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class AdminServiceController
{
    public function index(AdminServiceIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $isActive = array_key_exists('is_active', $validated)
            ? (bool) $validated['is_active']
            : null;

        $minPrice = $validated['min_price'] ?? null;
        $maxPrice = $validated['max_price'] ?? null;

        $paginator = Service::query()
            ->with('category')
            ->search($validated['search'] ?? null)
            ->filterCategoryId(
                array_key_exists('category_id', $validated)
                    ? (int) $validated['category_id']
                    : null,
            )
            ->filterCategorySlug($validated['category'] ?? null)
            ->filterActive($isActive)
            ->filterCurrency($validated['currency'] ?? null)
            ->filterDuration(
                array_key_exists('duration_minutes', $validated)
                    ? (int) $validated['duration_minutes']
                    : null,
            )
            ->filterPriceRange(
                $minPrice !== null ? (string) $minPrice : null,
                $maxPrice !== null ? (string) $maxPrice : null,
            )
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->orderBy('id', $request->sortDirection())
            ->paginate($request->perPage())
            ->withQueryString();

        return ApiResponse::success(
            data: ServiceResource::collection($paginator->items())->resolve(),
            message: __('services.list_retrieved'),
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function store(
        StoreServiceRequest $request,
        CreateService $createService,
    ): JsonResponse {
        $service = $createService->execute(
            CreateServiceData::fromValidated($request->validated()),
        );

        return ApiResponse::created(
            data: (new ServiceResource($service))->resolve(),
            message: __('services.created'),
        );
    }

    public function show(Service $service): JsonResponse
    {
        Gate::authorize('view', $service);

        $service->load('category');

        return ApiResponse::success(
            data: (new ServiceResource($service))->resolve(),
            message: __('services.details_retrieved'),
        );
    }

    public function update(
        UpdateServiceRequest $request,
        Service $service,
        UpdateService $updateService,
    ): JsonResponse {
        $updated = $updateService->execute(
            $service,
            UpdateServiceData::fromValidated($request->validated()),
        );

        return ApiResponse::success(
            data: (new ServiceResource($updated))->resolve(),
            message: __('services.updated'),
        );
    }

    public function updateStatus(
        UpdateServiceStatusRequest $request,
        Service $service,
        UpdateServiceStatus $updateServiceStatus,
    ): JsonResponse {
        $isActive = $request->boolean('is_active');

        $updated = $updateServiceStatus->execute($service, $isActive);

        return ApiResponse::success(
            data: (new ServiceResource($updated))->resolve(),
            message: $isActive
                ? __('services.activated')
                : __('services.deactivated'),
        );
    }

    public function destroy(
        Service $service,
        DeleteService $deleteService,
    ): JsonResponse {
        Gate::authorize('delete', $service);

        $deleteService->execute($service);

        return ApiResponse::success(
            message: __('services.deleted'),
        );
    }

    public function restore(
        int $id,
        RestoreService $restoreService,
        Request $request,
    ): JsonResponse {
        $service = Service::onlyTrashed()->find($id);

        if ($service === null) {
            abort(404);
        }

        Gate::authorize('restore', $service);

        $category = ServiceCategory::withTrashed()->find($service->category_id);

        if ($category === null || $category->trashed()) {
            return ApiResponse::error(
                message: __('services.category_unavailable_for_restore'),
                status: 422,
                errorCode: 'CATEGORY_UNAVAILABLE',
                requestId: $this->requestId($request),
            );
        }

        $restored = $restoreService->execute($service);

        return ApiResponse::success(
            data: (new ServiceResource($restored))->resolve(),
            message: __('services.restored'),
        );
    }

    private function requestId(Request $request): ?string
    {
        $requestId = $request->attributes->get('request_id');

        return is_string($requestId) && $requestId !== '' ? $requestId : null;
    }
}
