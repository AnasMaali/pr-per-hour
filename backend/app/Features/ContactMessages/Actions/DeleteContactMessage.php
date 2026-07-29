<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Actions;

use App\Features\ContactMessages\Models\ContactMessage;

final class DeleteContactMessage
{
    public function execute(ContactMessage $contactMessage): void
    {
        $contactMessage->delete();
    }
}
