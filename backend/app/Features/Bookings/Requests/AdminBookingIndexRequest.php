<?php

declare(strict_types=1);

namespace App\Features\Bookings\Requests;

use App\Enums\BookingStatus;
use App\Features\Bookings\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class AdminBookingIndexRequest extends FormRequest
{
    /** @var list<string> */
    public const SORTABLE = [
        'id',
        'booking_date',
        'start_time',
        'end_time',
        'status',
        'created_at',
        'updated_at',
    ];

    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Booking::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', 'string', Rule::enum(BookingStatus::class)],
            'user_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'service_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'booking_date' => ['sometimes', 'nullable', 'date'],
            'date_from' => ['sometimes', 'nullable', 'date'],
            'date_to' => ['sometimes', 'nullable', 'date'],
            'sort' => ['sometimes', 'string', Rule::in(self::SORTABLE)],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $from = $this->input('date_from');
            $to = $this->input('date_to');

            if ($from && $to && strtotime((string) $from) > strtotime((string) $to)) {
                $validator->errors()->add('date_from', __('bookings.invalid_date_range'));
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'search' => __('bookings.attributes.search'),
            'status' => __('bookings.attributes.status'),
            'user_id' => __('bookings.attributes.user_id'),
            'service_id' => __('bookings.attributes.service_id'),
            'booking_date' => __('bookings.attributes.booking_date'),
            'date_from' => __('bookings.attributes.date_from'),
            'date_to' => __('bookings.attributes.date_to'),
            'sort' => __('bookings.attributes.sort'),
            'direction' => __('bookings.attributes.direction'),
            'per_page' => __('bookings.attributes.per_page'),
        ];
    }

    public function sortColumn(): string
    {
        return (string) $this->validated('sort', 'booking_date');
    }

    public function sortDirection(): string
    {
        return (string) $this->validated('direction', 'desc');
    }

    public function perPage(): int
    {
        return (int) $this->validated('per_page', 15);
    }
}
