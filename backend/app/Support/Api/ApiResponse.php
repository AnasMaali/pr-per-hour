<?php

declare(strict_types=1);

namespace App\Support\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

final class ApiResponse
{
    /**
     * @param  array<string, mixed>  $meta
     */
    public static function success(
        mixed $data = null,
        ?string $message = null,
        array $meta = [],
        int $status = 200,
    ): JsonResponse {
        return self::payload(
            success: true,
            status: $status,
            message: $message,
            data: $data,
            meta: $meta,
        );
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    public static function created(
        mixed $data = null,
        ?string $message = null,
        array $meta = [],
    ): JsonResponse {
        return self::success($data, $message, $meta, 201);
    }

    public static function noContent(): Response
    {
        return response()->noContent();
    }

    /**
     * @param  array<string, mixed>  $errors
     * @param  array<string, mixed>  $meta
     */
    public static function error(
        string $message,
        int $status = 400,
        array $errors = [],
        ?string $errorCode = null,
        ?string $requestId = null,
        array $meta = [],
    ): JsonResponse {
        return self::payload(
            success: false,
            status: $status,
            message: $message,
            errors: $errors,
            errorCode: $errorCode,
            requestId: $requestId,
            meta: $meta,
        );
    }

    /**
     * @param  array<string, mixed>  $errors
     * @param  array<string, mixed>  $meta
     */
    private static function payload(
        bool $success,
        int $status,
        ?string $message = null,
        mixed $data = null,
        array $errors = [],
        ?string $errorCode = null,
        ?string $requestId = null,
        array $meta = [],
    ): JsonResponse {
        $payload = ['success' => $success];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        if ($success) {
            $payload['data'] = $data;
        } else {
            if ($errors !== []) {
                $payload['errors'] = $errors;
            }

            if ($errorCode !== null) {
                $payload['error_code'] = $errorCode;
            }

            if ($requestId !== null) {
                $payload['request_id'] = $requestId;
            }
        }

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }
}
