<?php

declare(strict_types=1);

namespace App\Features\Services\Controllers;

use App\Features\Services\Models\Service;
use App\Features\Services\Requests\PublicServiceIndexRequest;
use App\Features\Services\Resources\ServiceResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;

final class PublicServiceController
{
    public function index(PublicServiceIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $minPrice = $validated['min_price'] ?? null;
        $maxPrice = $validated['max_price'] ?? null;

        $paginator = Service::query()
            ->publiclyVisible()
            ->with('category')
            ->search($validated['search'] ?? null)
            ->filterCategorySlug($validated['category'] ?? null)
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

    public function show(string $slug): JsonResponse
    {
        $service = Service::query()
            ->publiclyVisible()
            ->with('category')
            ->where('slug', $slug)
            ->first();

        if ($service === null) {
            abort(404);
        }

        return ApiResponse::success(
            data: (new ServiceResource($service))->resolve(),
            message: __('services.details_retrieved'),
        );
    }
}
