<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\Api\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->isAdmin()) {
            return ApiResponse::error(
                message: __('auth.forbidden'),
                status: 403,
                errorCode: 'FORBIDDEN',
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
