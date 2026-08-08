<?php

declare(strict_types=1);

namespace App\Enums;

enum BookingCalendarMode: string
{
    case Shared = 'shared';

    /*
     * Future extension point:
     *
     * case PerConsultant = 'per_consultant';
     * case PerResource = 'per_resource';
     *
     * Do not activate these modes until the corresponding
     * database relationships and business requirements exist.
     */
}
