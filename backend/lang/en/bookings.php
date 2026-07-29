<?php

declare(strict_types=1);

return [
    'created' => 'Booking created successfully.',
    'list_retrieved' => 'Bookings retrieved successfully.',
    'details_retrieved' => 'Booking retrieved successfully.',
    'cancelled' => 'Booking cancelled successfully.',
    'status_updated' => 'Booking status updated successfully.',
    'meeting_link_updated' => 'Meeting link updated successfully.',
    'notes_updated' => 'Booking notes updated successfully.',
    'time_conflict' => 'The selected time overlaps an existing booking for this service.',
    'cannot_cancel' => 'This booking cannot be cancelled.',
    'invalid_status_transition' => 'This status transition is not allowed.',
    'service_unavailable' => 'The selected service is unavailable for booking.',
    'invalid_date_range' => 'The start date may not be after the end date.',
    'forbidden_field' => 'This field is not allowed on this endpoint.',
    'unauthorized_ownership' => 'You are not allowed to access this booking.',

    'attributes' => [
        'service_id' => 'service',
        'booking_date' => 'booking date',
        'start_time' => 'start time',
        'end_time' => 'end time',
        'notes' => 'notes',
        'status' => 'status',
        'meeting_link' => 'meeting link',
        'user_id' => 'user',
        'search' => 'search',
        'date_from' => 'start date',
        'date_to' => 'end date',
        'sort' => 'sort field',
        'direction' => 'sort direction',
        'per_page' => 'per page',
    ],
];
