<?php

declare(strict_types=1);

namespace App\Features\Bookings\Controllers;

use App\Features\Bookings\Actions\UpdateBookingMeetingLink;
use App\Features\Bookings\Actions\UpdateBookingNotes;
use App\Features\Bookings\Actions\UpdateBookingStatus;
use App\Features\Bookings\DTOs\UpdateBookingMeetingLinkData;
use App\Features\Bookings\DTOs\UpdateBookingNotesData;
use App\Features\Bookings\DTOs\UpdateBookingStatusData;
use App\Features\Bookings\Exceptions\BookingDomainException;
use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\Requests\AdminBookingIndexRequest;
use App\Features\Bookings\Requests\UpdateBookingMeetingLinkRequest;
use App\Features\Bookings\Requests\UpdateBookingNotesRequest;
use App\Features\Bookings\Requests\UpdateBookingStatusRequest;
use App\Features\Bookings\Resources\BookingResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class AdminBookingController
{
    public function index(AdminBookingIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $paginator = Booking::query()
            ->with(['user', 'service.category'])
            ->search($validated['search'] ?? null)
            ->filterStatus($validated['status'] ?? null)
            ->filterUser(
                array_key_exists('user_id', $validated) && $validated['user_id'] !== null
                    ? (int) $validated['user_id']
                    : null,
            )
            ->filterService(
                array_key_exists('service_id', $validated) && $validated['service_id'] !== null
                    ? (int) $validated['service_id']
                    : null,
            )
            ->filterBookingDate($validated['booking_date'] ?? null)
            ->filterDateBetween(
                $validated['date_from'] ?? null,
                $validated['date_to'] ?? null,
            )
            ->orderBy($request->sortColumn(), $request->sortDirection())
            ->when(
                $request->sortColumn() === 'booking_date',
                fn ($query) => $query->orderBy('start_time', $request->sortDirection()),
            )
            ->orderBy('id', $request->sortDirection())
            ->paginate($request->perPage())
            ->withQueryString();

        return ApiResponse::success(
            data: BookingResource::collection($paginator->items())->resolve(),
            message: __('bookings.list_retrieved'),
            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        );
    }

    public function show(Booking $booking): JsonResponse
    {
        Gate::authorize('viewAny', Booking::class);

        $booking->load(['user', 'service.category']);

        return ApiResponse::success(
            data: (new BookingResource($booking))->resolve(),
            message: __('bookings.details_retrieved'),
        );
    }

    public function updateStatus(
        UpdateBookingStatusRequest $request,
        Booking $booking,
        UpdateBookingStatus $updateBookingStatus,
    ): JsonResponse {
        try {
            $updated = $updateBookingStatus->execute(
                $booking,
                UpdateBookingStatusData::fromValidated($request->validated()),
            );
        } catch (BookingDomainException $exception) {
            return ApiResponse::error(
                message: $exception->getMessage(),
                status: 422,
                errorCode: $exception->errorCode,
                requestId: $this->requestId($request),
            );
        }

        return ApiResponse::success(
            data: (new BookingResource($updated))->resolve(),
            message: __('bookings.status_updated'),
        );
    }

    public function updateMeetingLink(
        UpdateBookingMeetingLinkRequest $request,
        Booking $booking,
        UpdateBookingMeetingLink $updateBookingMeetingLink,
    ): JsonResponse {
        $updated = $updateBookingMeetingLink->execute(
            $booking,
            UpdateBookingMeetingLinkData::fromValidated($request->validated()),
        );

        return ApiResponse::success(
            data: (new BookingResource($updated))->resolve(),
            message: __('bookings.meeting_link_updated'),
        );
    }

    public function updateNotes(
        UpdateBookingNotesRequest $request,
        Booking $booking,
        UpdateBookingNotes $updateBookingNotes,
    ): JsonResponse {
        $updated = $updateBookingNotes->execute(
            $booking,
            UpdateBookingNotesData::fromValidated($request->validated()),
        );

        return ApiResponse::success(
            data: (new BookingResource($updated))->resolve(),
            message: __('bookings.notes_updated'),
        );
    }

    private function requestId(Request $request): ?string
    {
        $requestId = $request->attributes->get('request_id');

        return is_string($requestId) && $requestId !== '' ? $requestId : null;
    }
}
