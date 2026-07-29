<?php

declare(strict_types=1);

namespace App\Features\Bookings\Controllers;

use App\Features\Bookings\Actions\CancelBooking;
use App\Features\Bookings\Actions\CreateBooking;
use App\Features\Bookings\DTOs\CreateBookingData;
use App\Features\Bookings\Exceptions\BookingDomainException;
use App\Features\Bookings\Models\Booking;
use App\Features\Bookings\Requests\ClientBookingIndexRequest;
use App\Features\Bookings\Requests\StoreBookingRequest;
use App\Features\Bookings\Resources\BookingResource;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class ClientBookingController
{
    public function store(StoreBookingRequest $request, CreateBooking $createBooking): JsonResponse
    {
        try {
            $booking = $createBooking->execute(
                CreateBookingData::fromValidated(
                    $request->validated(),
                    (int) $request->user()->id,
                ),
            );
        } catch (BookingDomainException $exception) {
            return ApiResponse::error(
                message: $exception->getMessage(),
                status: 422,
                errorCode: $exception->errorCode,
                requestId: $this->requestId($request),
            );
        }

        return ApiResponse::created(
            data: (new BookingResource($booking))->resolve(),
            message: __('bookings.created'),
        );
    }

    public function index(ClientBookingIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $paginator = Booking::query()
            ->forUser((int) $request->user()->id)
            ->with(['service.category'])
            ->filterStatus($validated['status'] ?? null)
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

    public function show(Request $request, Booking $booking): JsonResponse
    {
        Gate::authorize('view', $booking);

        $booking->load(['service.category']);

        return ApiResponse::success(
            data: (new BookingResource($booking))->resolve(),
            message: __('bookings.details_retrieved'),
        );
    }

    public function cancel(
        Request $request,
        Booking $booking,
        CancelBooking $cancelBooking,
    ): JsonResponse {
        Gate::authorize('cancel', $booking);

        try {
            $updated = $cancelBooking->execute($booking);
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
            message: __('bookings.cancelled'),
        );
    }

    private function requestId(Request $request): ?string
    {
        $requestId = $request->attributes->get('request_id');

        return is_string($requestId) && $requestId !== '' ? $requestId : null;
    }
}
