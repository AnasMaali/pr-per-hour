<?php

declare(strict_types=1);

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\ResetPasswordWithCode;
use App\Features\Auth\Exceptions\CodeAttemptsExceededException;
use App\Features\Auth\Exceptions\InvalidOrExpiredCodeException;
use App\Features\Auth\Requests\ResetPasswordRequest;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ResetPasswordController
{
    public function __invoke(
        ResetPasswordRequest $request,
        ResetPasswordWithCode $action,
    ): JsonResponse {
        $validated = $request->validated();

        try {
            $action->execute(
                $validated['email'],
                $validated['code'],
                $validated['password'],
            );
        } catch (CodeAttemptsExceededException) {
            return ApiResponse::error(
                message: __('auth.code_attempts_exceeded'),
                status: 422,
                errorCode: 'CODE_ATTEMPTS_EXCEEDED',
                requestId: $this->requestId($request),
            );
        } catch (InvalidOrExpiredCodeException) {
            return ApiResponse::error(
                message: __('auth.reset_code_invalid'),
                status: 422,
                errorCode: 'RESET_CODE_INVALID',
                requestId: $this->requestId($request),
            );
        }

        return ApiResponse::success(
            message: __('auth.password_reset_success'),
        );
    }

    private function requestId(Request $request): ?string
    {
        $requestId = $request->attributes->get('request_id');

        return is_string($requestId) && $requestId !== '' ? $requestId : null;
    }
}
