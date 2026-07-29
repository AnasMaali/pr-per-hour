<?php

declare(strict_types=1);

namespace App\Features\Auth\Services;

enum OneTimeCodeConsumeStatus
{
    case Success;
    case InvalidOrExpired;
    case AttemptsExceeded;
}
