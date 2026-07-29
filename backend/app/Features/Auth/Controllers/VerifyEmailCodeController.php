<?php

declare(strict_types=1);

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\VerifyEmailCode;
use App\Features\Auth\Exceptions\CodeAttemptsExceededException;
use App\Features\Auth\Exceptions\InvalidOrExpiredCodeException;
use App\Features\Auth\Requests\VerifyEmailCodeRequest;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class VerifyEmailCodeController
{
    public function __invoke(
        VerifyEmailCodeRequest $request,
        VerifyEmailCode $action,
    ): JsonResponse {
        $validated = $request->validated();

        try {
            $action->execute($validated['email'], $validated['code']);
        } catch (CodeAttemptsExceededException) {
            return ApiResponse::error(
                message: __('auth.code_attempts_exceeded'),
                status: 422,
                errorCode: 'CODE_ATTEMPTS_EXCEEDED',
                requestId: $this->requestId($request),
            );
        } catch (InvalidOrExpiredCodeException) {
            return ApiResponse::error(
                message: __('auth.invalid_or_expired_code'),
                status: 422,
                errorCode: 'INVALID_OR_EXPIRED_CODE',
                requestId: $this->requestId($request),
            );
        }

        return ApiResponse::success(
            message: __('auth.email_verified'),
        );
    }

    private function requestId(Request $request): ?string
    {
        $requestId = $request->attributes->get('request_id');

        return is_string($requestId) && $requestId !== '' ? $requestId : null;
    }
}
