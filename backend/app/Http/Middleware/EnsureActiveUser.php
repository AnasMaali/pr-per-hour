<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use App\Support\Api\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureActiveUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return ApiResponse::error(
                message: __('auth.unauthenticated'),
                status: 401,
                errorCode: 'UNAUTHENTICATED',
                requestId: $this->requestId($request),
            );
        }

        if ($user->status !== UserStatus::Active) {
            $user->tokens()->delete();

            return ApiResponse::error(
                message: __('auth.inactive_account'),
                status: 403,
                errorCode: 'INACTIVE_ACCOUNT',
                requestId: $this->requestId($request),
            );
        }

        /** @var Response $response */
        $response = $next($request);

        return $response;
    }

    private function requestId(Request $request): ?string
    {
        $requestId = $request->attributes->get('request_id');

        return is_string($requestId) && $requestId !== '' ? $requestId : null;
    }
}
