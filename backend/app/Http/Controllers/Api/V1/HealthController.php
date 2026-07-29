<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;

final class HealthController
{
    public function __invoke(): JsonResponse
    {
        return ApiResponse::success(
            data: [
                'status' => 'healthy',
                'service' => 'pr-per-hour-api',
                'version' => 'v1',
                'timestamp' => now()->toIso8601String(),
            ],
            message: __('api.health_ok'),
        );
    }
}
