<?php

declare(strict_types=1);

namespace App\Features\Users\Controllers;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Features\Users\Actions\UpdateUserStatus;
use App\Features\Users\Models\User;
use App\Features\Users\Requests\AdminUserIndexRequest;
use App\Features\Users\Requests\UpdateUserStatusRequest;
use App\Features\Users\Resources\AdminUserResource;
use App\Support\Api\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

final class AdminUserController
{
    public function index(AdminUserIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $search = isset($validated['search']) ? trim((string) $validated['search']) : '';

        $paginator = User::query()
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $nested) use ($search): void {
                    $nested->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when(isset($validated['role']), fn (Builder $query) => $query->where('role', UserRole::from((string) $validated['role'])->value))
            ->when(isset($validated['status']), fn (Builder $query) => $query->where('status', UserStatus::from((string) $validated['status'])->value))
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->orderBy('id', $request->sortDirection())
            ->paginate($request->perPage())
            ->withQueryString();

        return ApiResponse::success(
            data: AdminUserResource::collection($paginator->items())->resolve(),
            message: __('users.list_retrieved'),
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function show(User $user): JsonResponse
    {
        Gate::authorize('view', $user);

        return ApiResponse::success(
            data: (new AdminUserResource($user))->resolve(),
            message: __('users.details_retrieved'),
        );
    }

    public function updateStatus(
        UpdateUserStatusRequest $request,
        User $user,
        UpdateUserStatus $updateUserStatus,
    ): JsonResponse {
        $status = UserStatus::from((string) $request->validated('status'));
        $updated = $updateUserStatus->execute($user, $status);

        return ApiResponse::success(
            data: (new AdminUserResource($updated))->resolve(),
            message: $status === UserStatus::Active
                ? __('users.activated')
                : __('users.deactivated'),
        );
    }
}
