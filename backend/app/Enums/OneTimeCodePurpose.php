<?php

declare(strict_types=1);

namespace App\Enums;

enum OneTimeCodePurpose: string
{
    case VerifyEmail = 'verify_email';
    case PasswordReset = 'password_reset';
}
