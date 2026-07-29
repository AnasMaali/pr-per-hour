<?php

declare(strict_types=1);

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Resources\AuthenticatedUserResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CurrentUserController
{
    public function __invoke(Request $request): JsonResponse
    {
        return ApiResponse::success(
            data: (new AuthenticatedUserResource($request->user()))->resolve(),
            message: __('auth.me_success'),
        );
    }
}
