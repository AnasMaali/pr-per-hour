<?php

declare(strict_types=1);

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\AuthenticateUser;
use App\Features\Auth\DTOs\LoginData;
use App\Features\Auth\Exceptions\EmailVerificationRequiredException;
use App\Features\Auth\Exceptions\InactiveAccountException;
use App\Features\Auth\Requests\LoginRequest;
use App\Features\Auth\Resources\AuthenticatedUserResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class LoginController
{
    public function __invoke(
        LoginRequest $request,
        AuthenticateUser $authenticateUser,
    ): JsonResponse {
        try {
            $result = $authenticateUser->execute(
                LoginData::fromValidated($request->validated()),
            );
        } catch (InactiveAccountException) {
            return ApiResponse::error(
                message: __('auth.inactive_account'),
                status: 403,
                errorCode: 'INACTIVE_ACCOUNT',
                requestId: $this->requestId($request),
            );
        } catch (EmailVerificationRequiredException) {
            return ApiResponse::error(
                message: __('auth.email_verification_required'),
                status: 403,
                errorCode: 'EMAIL_VERIFICATION_REQUIRED',
                requestId: $this->requestId($request),
            );
        }

        return ApiResponse::success(
            data: [
                'user' => (new AuthenticatedUserResource($result['user']))->resolve(),
                'token' => $result['token']->plainTextToken,
                'token_type' => 'Bearer',
            ],
            message: __('auth.login_success'),
        );
    }

    private function requestId(Request $request): ?string
    {
        $requestId = $request->attributes->get('request_id');

        return is_string($requestId) && $requestId !== '' ? $requestId : null;
    }
}
