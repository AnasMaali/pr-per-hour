<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Controllers;

use App\Enums\ContactMessageStatus;
use App\Features\ContactMessages\Actions\DeleteContactMessage;
use App\Features\ContactMessages\Actions\RestoreContactMessage;
use App\Features\ContactMessages\Actions\UpdateContactMessageStatus;
use App\Features\ContactMessages\Models\ContactMessage;
use App\Features\ContactMessages\Requests\AdminContactMessageIndexRequest;
use App\Features\ContactMessages\Requests\UpdateContactMessageStatusRequest;
use App\Features\ContactMessages\Resources\ContactMessageResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

final class AdminContactMessageController
{
    public function index(AdminContactMessageIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $paginator = ContactMessage::query()
            ->search($validated['search'] ?? null)
            ->filterStatus($validated['status'] ?? null)
            ->filterEmail($validated['email'] ?? null)
            ->filterOrganization($validated['organization'] ?? null)
            ->filterCreatedBetween(
                $validated['created_from'] ?? null,
                $validated['created_to'] ?? null,
            )
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->orderBy('id', $request->sortDirection())
            ->paginate($request->perPage())
            ->withQueryString();

        return ApiResponse::success(
            data: ContactMessageResource::collection($paginator->items())->resolve(),
            message: __('contact_messages.list_retrieved'),
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function show(ContactMessage $contactMessage): JsonResponse
    {
        Gate::authorize('view', $contactMessage);

        return ApiResponse::success(
            data: (new ContactMessageResource($contactMessage))->resolve(),
            message: __('contact_messages.details_retrieved'),
        );
    }

    public function updateStatus(
        UpdateContactMessageStatusRequest $request,
        ContactMessage $contactMessage,
        UpdateContactMessageStatus $updateContactMessageStatus,
    ): JsonResponse {
        $status = ContactMessageStatus::from((string) $request->validated('status'));

        $updated = $updateContactMessageStatus->execute($contactMessage, $status);

        return ApiResponse::success(
            data: (new ContactMessageResource($updated))->resolve(),
            message: $this->statusMessage($status),
        );
    }

    public function destroy(
        ContactMessage $contactMessage,
        DeleteContactMessage $deleteContactMessage,
    ): JsonResponse {
        Gate::authorize('delete', $contactMessage);

        $deleteContactMessage->execute($contactMessage);

        return ApiResponse::success(
            message: __('contact_messages.deleted'),
        );
    }

    public function restore(
        int $id,
        RestoreContactMessage $restoreContactMessage,
    ): JsonResponse {
        $contactMessage = ContactMessage::onlyTrashed()->find($id);

        if ($contactMessage === null) {
            abort(404);
        }

        Gate::authorize('restore', $contactMessage);

        $restored = $restoreContactMessage->execute($contactMessage);

        return ApiResponse::success(
            data: (new ContactMessageResource($restored))->resolve(),
            message: __('contact_messages.restored'),
        );
    }

    private function statusMessage(ContactMessageStatus $status): string
    {
        return match ($status) {
            ContactMessageStatus::New => __('contact_messages.status_set_new'),
            ContactMessageStatus::Read => __('contact_messages.status_set_read'),
            ContactMessageStatus::Replied => __('contact_messages.status_set_replied'),
            ContactMessageStatus::Closed => __('contact_messages.status_set_closed'),
        };
    }
}
