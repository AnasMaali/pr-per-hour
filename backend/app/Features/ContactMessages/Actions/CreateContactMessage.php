<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Actions;

use App\Enums\ContactMessageStatus;
use App\Features\ContactMessages\DTOs\CreateContactMessageData;
use App\Features\ContactMessages\Models\ContactMessage;
use App\Features\ContactMessages\Notifications\ContactInquiryReceivedNotification;
use Illuminate\Support\Facades\Notification;
use Throwable;

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

        $this->sendCompanyNotification($message);

        return $message;
    }

    private function sendCompanyNotification(ContactMessage $message): void
    {
        $recipientAddress = (string) config('mail.inquiries.address');
        $recipientName = (string) config('mail.inquiries.name');

        if ($recipientAddress === '') {
            return;
        }

        try {
            Notification::route('mail', [
                $recipientAddress => $recipientName,
            ])->notify(
                new ContactInquiryReceivedNotification($message),
            );
        } catch (Throwable $exception) {
            /*
             * The inquiry remains saved in the database even if the
             * email provider is temporarily unavailable.
             */
            report($exception);
        }
    }
}