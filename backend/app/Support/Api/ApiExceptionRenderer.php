<?php

declare(strict_types=1);

namespace App\Support\Api;

use App\Features\Auth\Exceptions\HumanVerificationFailedException;
use App\Support\Localization\LocaleResolver;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

final class ApiExceptionRenderer
{
    public static function register(Exceptions $exceptions): void
    {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request): bool => self::isApiRequest($request),
        );

        $exceptions->render(function (Throwable $e, Request $request): ?JsonResponse {
            if (! self::isApiRequest($request)) {
                return null;
            }

            return self::render($e, $request);
        });
    }

    public static function isApiRequest(Request $request): bool
    {
        return $request->is('api/*') || $request->expectsJson();
    }

    public static function render(Throwable $e, Request $request): JsonResponse
    {
        $locale = self::ensureLocale($request);
        $requestId = self::ensureRequestId($request);

        if ($e instanceof ValidationException) {
            return self::withHeaders(
                ApiResponse::error(
                    message: __('api.validation_failed'),
                    status: 422,
                    errors: $e->errors(),
                    errorCode: 'VALIDATION_FAILED',
                    requestId: $requestId,
                ),
                $locale,
                $requestId,
            );
        }

        if ($e instanceof HumanVerificationFailedException) {
            return self::withHeaders(
                ApiResponse::error(
                    message: $e->getMessage() !== ''
                        ? $e->getMessage()
                        : __('auth.human_verification_failed'),
                    status: 422,
                    errorCode: 'HUMAN_VERIFICATION_FAILED',
                    requestId: $requestId,
                ),
                $locale,
                $requestId,
            );
        }

        if ($e instanceof AuthenticationException) {
            return self::withHeaders(
                ApiResponse::error(
                    message: __('api.unauthenticated'),
                    status: 401,
                    errorCode: 'UNAUTHENTICATED',
                    requestId: $requestId,
                ),
                $locale,
                $requestId,
            );
        }

        if ($e instanceof AuthorizationException) {
            return self::withHeaders(
                ApiResponse::error(
                    message: __('api.unauthorized'),
                    status: 403,
                    errorCode: 'UNAUTHORIZED',
                    requestId: $requestId,
                ),
                $locale,
                $requestId,
            );
        }

        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return self::withHeaders(
                ApiResponse::error(
                    message: __('api.not_found'),
                    status: 404,
                    errorCode: 'NOT_FOUND',
                    requestId: $requestId,
                ),
                $locale,
                $requestId,
            );
        }

        if ($e instanceof MethodNotAllowedHttpException) {
            return self::withHeaders(
                ApiResponse::error(
                    message: __('api.method_not_allowed'),
                    status: 405,
                    errorCode: 'METHOD_NOT_ALLOWED',
                    requestId: $requestId,
                ),
                $locale,
                $requestId,
            );
        }

        if ($e instanceof TooManyRequestsHttpException || self::isThrottleException($e)) {
            return self::withHeaders(
                ApiResponse::error(
                    message: __('api.too_many_requests'),
                    status: 429,
                    errorCode: 'TOO_MANY_REQUESTS',
                    requestId: $requestId,
                ),
                $locale,
                $requestId,
            );
        }

        if ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();

            if ($status >= 400 && $status < 500) {
                return self::withHeaders(
                    ApiResponse::error(
                        message: __('api.client_error'),
                        status: $status,
                        errorCode: 'HTTP_ERROR',
                        requestId: $requestId,
                    ),
                    $locale,
                    $requestId,
                );
            }
        }

        Log::error('Unhandled API exception', [
            'request_id' => $requestId,
            'exception' => $e::class,
            'message' => $e->getMessage(),
        ]);

        return self::withHeaders(
            ApiResponse::error(
                message: __('api.server_error'),
                status: 500,
                errorCode: 'SERVER_ERROR',
                requestId: $requestId,
            ),
            $locale,
            $requestId,
        );
    }

    private static function withHeaders(JsonResponse $response, string $locale, ?string $requestId): JsonResponse
    {
        $response->headers->set('Content-Language', $locale);

        if ($requestId !== null) {
            $response->headers->set('X-Request-ID', $requestId);
        }

        return $response;
    }

    private static function ensureRequestId(Request $request): string
    {
        $requestId = $request->attributes->get('request_id');

        if (is_string($requestId) && $requestId !== '') {
            return $requestId;
        }

        $incoming = $request->headers->get('X-Request-ID');
        if (is_string($incoming)) {
            $incoming = trim($incoming);
            if ($incoming !== '' && strlen($incoming) <= 64 && preg_match('/^[A-Za-z0-9\-]+$/', $incoming)) {
                $request->attributes->set('request_id', $incoming);

                return $incoming;
            }
        }

        $generated = (string) Str::uuid();
        $request->attributes->set('request_id', $generated);

        return $generated;
    }

    private static function ensureLocale(Request $request): string
    {
        $locale = $request->attributes->get('locale');

        if (is_string($locale) && $locale !== '') {
            app()->setLocale($locale);

            return $locale;
        }

        $resolved = app(LocaleResolver::class)->resolve($request);
        app()->setLocale($resolved);
        $request->attributes->set('locale', $resolved);

        return $resolved;
    }

    private static function isThrottleException(Throwable $e): bool
    {
        return $e instanceof ThrottleRequestsException;
    }
}
