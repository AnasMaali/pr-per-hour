<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Actions;

use App\Enums\ContactMessageStatus;
use App\Features\ContactMessages\Models\ContactMessage;

final class UpdateContactMessageStatus
{
    public function execute(ContactMessage $contactMessage, ContactMessageStatus $status): ContactMessage
    {
        $contactMessage->status = $status;
        $contactMessage->save();

        return $contactMessage->refresh();
    }
}
