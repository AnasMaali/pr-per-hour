<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Controllers;

use App\Features\ContactMessages\Actions\CreateContactMessage;
use App\Features\ContactMessages\DTOs\CreateContactMessageData;
use App\Features\ContactMessages\Requests\StoreContactMessageRequest;
use App\Features\ContactMessages\Resources\ContactMessageReceiptResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;

final class PublicContactMessageController
{
    public function store(
        StoreContactMessageRequest $request,
        CreateContactMessage $createContactMessage,
    ): JsonResponse {
        $message = $createContactMessage->execute(
            CreateContactMessageData::fromValidated($request->validated()),
        );

        return ApiResponse::created(
            data: (new ContactMessageReceiptResource($message))->resolve(),
            message: __('contact_messages.submitted'),
        );
    }
}
