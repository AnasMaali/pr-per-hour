<?php

declare(strict_types=1);

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\LogoutUser;
use App\Features\Users\Models\User;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class LogoutController
{
    public function __invoke(Request $request, LogoutUser $logoutUser): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $logoutUser->execute($user, $request);

        return ApiResponse::success(
            message: __('auth.logout_success'),
        );
    }
}
