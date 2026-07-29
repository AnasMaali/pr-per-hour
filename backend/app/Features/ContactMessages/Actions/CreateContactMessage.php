<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Actions;

use App\Enums\ContactMessageStatus;
use App\Features\ContactMessages\DTOs\CreateContactMessageData;
use App\Features\ContactMessages\Models\ContactMessage;

final class CreateContactMessage
{
    public function execute(CreateContactMessageData $data): ContactMessage
    {
        $message = new ContactMessage;
        $message->full_name = $data->fullName;
        $message->email = $data->email;
        $message->phone = $data->phone;
        $message->organization = $data->organization;
        $message->message = $data->message;
        $message->status = ContactMessageStatus::New;
        $message->save();

        return $message;
    }
}
