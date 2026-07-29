<?php

declare(strict_types=1);

namespace App\Features\Bookings\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateBookingNotesRequest extends FormRequest
{
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        return $this->user()?->can('updateNotes', $booking) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'notes' => [
                'present',
                'nullable',
                'string',
                'max:'.StoreBookingRequest::NOTES_MAX_LENGTH,
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'notes' => __('bookings.attributes.notes'),
        ];
    }
}
