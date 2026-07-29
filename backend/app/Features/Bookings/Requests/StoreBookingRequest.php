<?php

declare(strict_types=1);

namespace App\Features\Bookings\Requests;

use App\Features\Bookings\Models\Booking;
use App\Features\Services\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class StoreBookingRequest extends FormRequest
{
    /** Application-level safety limit for TEXT notes (not a DB column length). */
    public const NOTES_MAX_LENGTH = 5000;

    /** @var list<string> */
    private const FORBIDDEN_FIELDS = [
        'id',
        'user_id',
        'status',
        'meeting_link',
        'created_at',
        'updated_at',
        'deleted_at',
        'payment_id',
        'invoice_id',
        'paid',
    ];

    public function authorize(): bool
    {
        return $this->user()?->can('create', Booking::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'service_id' => [
                'required',
                'integer',
                Rule::exists('services', 'id')->whereNull('deleted_at'),
            ],
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:'.self::NOTES_MAX_LENGTH],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach (self::FORBIDDEN_FIELDS as $field) {
                if (array_key_exists($field, $this->all())) {
                    $validator->errors()->add($field, __('bookings.forbidden_field'));
                }
            }

            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $serviceId = $this->input('service_id');
            if (! is_numeric($serviceId)) {
                return;
            }

            $bookable = Service::query()
                ->publiclyVisible()
                ->whereKey((int) $serviceId)
                ->exists();

            if (! $bookable) {
                $validator->errors()->add('service_id', __('bookings.service_unavailable'));
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'service_id' => __('bookings.attributes.service_id'),
            'booking_date' => __('bookings.attributes.booking_date'),
            'start_time' => __('bookings.attributes.start_time'),
            'end_time' => __('bookings.attributes.end_time'),
            'notes' => __('bookings.attributes.notes'),
        ];
    }
}
