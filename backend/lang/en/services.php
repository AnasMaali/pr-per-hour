<?php

declare(strict_types=1);

return [
    'list_retrieved' => 'Services retrieved successfully.',
    'details_retrieved' => 'Service retrieved successfully.',
    'created' => 'Service created successfully.',
    'updated' => 'Service updated successfully.',
    'activated' => 'Service activated successfully.',
    'deactivated' => 'Service deactivated successfully.',
    'deleted' => 'Service deleted successfully.',
    'restored' => 'Service restored successfully.',
    'category_unavailable_for_restore' => 'This service cannot be restored because its category is deleted.',
    'forbidden_field_update' => 'This field cannot be updated through this endpoint.',
    'no_update_fields' => 'Provide at least one service field to update.',
    'invalid_price_range' => 'The minimum price may not be greater than the maximum price.',

    'attributes' => [
        'category_id' => 'category',
        'category' => 'category',
        'title' => 'title',
        'slug' => 'slug',
        'description' => 'description',
        'duration_minutes' => 'duration',
        'price' => 'price',
        'currency' => 'currency',
        'is_active' => 'active status',
        'search' => 'search',
        'min_price' => 'minimum price',
        'max_price' => 'maximum price',
        'sort' => 'sort field',
        'direction' => 'sort direction',
        'per_page' => 'per page',
    ],
];
