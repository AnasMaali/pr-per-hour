<?php

declare(strict_types=1);

namespace App\Enums;

enum ChatSender: string
{
    case Visitor = 'visitor';
    case Client = 'client';
    case Bot = 'bot';
    case Admin = 'admin';
}
