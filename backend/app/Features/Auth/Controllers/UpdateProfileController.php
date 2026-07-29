<?php

declare(strict_types=1);

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\UpdateProfile;
use App\Features\Auth\DTOs\UpdateProfileData;
use App\Features\Auth\Requests\UpdateProfileRequest;
use App\Features\Auth\Resources\AuthenticatedUserResource;
use App\Features\Users\Models\User;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;

final class UpdateProfileController
{
    public function __invoke(
        UpdateProfileRequest $request,
        UpdateProfile $updateProfile,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        $updated = $updateProfile->execute(
            $user,
            UpdateProfileData::fromValidated($request->validated()),
        );

        return ApiResponse::success(
            data: (new AuthenticatedUserResource($updated))->resolve(),
            message: __('auth.profile_update_success'),
        );
    }
}
