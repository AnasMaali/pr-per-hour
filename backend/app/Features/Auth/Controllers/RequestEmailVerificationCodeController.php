<?php

declare(strict_types=1);

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\SendEmailVerificationCode;
use App\Features\Auth\Exceptions\EmailAlreadyVerifiedException;
use App\Features\Auth\Exceptions\MailDeliveryFailedException;
use App\Features\Auth\Exceptions\OtpResendCooldownException;
use App\Features\Auth\Requests\RequestEmailVerificationCodeRequest;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class RequestEmailVerificationCodeController
{
    public function __invoke(
        RequestEmailVerificationCodeRequest $request,
        SendEmailVerificationCode $action,
    ): JsonResponse {
        try {
            $result = $action->execute($request->validated('email'));
        } catch (EmailAlreadyVerifiedException $exception) {
            return ApiResponse::error(
                message: $exception->getMessage(),
                status: 422,
                errorCode: 'EMAIL_ALREADY_VERIFIED',
                requestId: $this->requestId($request),
            );
        } catch (OtpResendCooldownException $exception) {
            return ApiResponse::error(
                message: $exception->getMessage(),
                status: 429,
                errorCode: 'TOO_MANY_REQUESTS',
                requestId: $this->requestId($request),
                meta: ['retry_after' => $exception->retryAfterSeconds],
            )->withHeaders([
                'Retry-After' => (string) max(1, $exception->retryAfterSeconds),
            ]);
        } catch (MailDeliveryFailedException $exception) {
            return ApiResponse::error(
                message: $exception->getMessage(),
                status: 503,
                errorCode: 'MAIL_DELIVERY_FAILED',
                requestId: $this->requestId($request),
            );
        }

        return ApiResponse::success(
            data: [
                'sent' => $result['sent'],
            ],
            message: __('auth.verification_code_sent'),
        );
    }

    private function requestId(Request $request): ?string
    {
        $requestId = $request->attributes->get('request_id');

        return is_string($requestId) && $requestId !== '' ? $requestId : null;
    }
}
