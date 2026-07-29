<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Actions;

use App\Features\ContactMessages\Models\ContactMessage;

final class RestoreContactMessage
{
    public function execute(ContactMessage $contactMessage): ContactMessage
    {
        $contactMessage->restore();

        return $contactMessage->refresh();
    }
}
