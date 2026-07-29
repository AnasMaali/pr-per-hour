<?php

declare(strict_types=1);

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Actions\RegisterClient;
use App\Features\Auth\DTOs\RegisterClientData;
use App\Features\Auth\Requests\RegisterRequest;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;

final class RegisterController
{
    public function __invoke(RegisterRequest $request, RegisterClient $registerClient): JsonResponse
    {
        $result = $registerClient->execute(
            RegisterClientData::fromValidated($request->validated()),
        );

        return ApiResponse::created(
            data: [
                'email' => $result['user']->email,
                'email_verification_required' => true,
                'verification_sent' => $result['verification_sent'],
            ],
            message: __('auth.registration_verification_required'),
        );
    }
}
