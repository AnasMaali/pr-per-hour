<?php

declare(strict_types=1);

namespace App\Features\Bookings\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateBookingMeetingLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        return $this->user()?->can('updateMeetingLink', $booking) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'meeting_link' => ['present', 'nullable', 'string', 'url', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'meeting_link' => __('bookings.attributes.meeting_link'),
        ];
    }
}
