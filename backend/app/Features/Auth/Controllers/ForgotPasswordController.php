<?php

declare(strict_types=1);

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\SendPasswordResetCode;
use App\Features\Auth\Exceptions\OtpResendCooldownException;
use App\Features\Auth\Requests\ForgotPasswordRequest;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;

final class ForgotPasswordController
{
    public function __invoke(
        ForgotPasswordRequest $request,
        SendPasswordResetCode $action,
    ): JsonResponse {
        try {
            $action->execute($request->validated('email'));
        } catch (OtpResendCooldownException) {
            // Keep the generic success body so cooldown does not reveal account existence.
        }

        return ApiResponse::success(
            message: __('auth.password_reset_code_sent'),
        );
    }
}
