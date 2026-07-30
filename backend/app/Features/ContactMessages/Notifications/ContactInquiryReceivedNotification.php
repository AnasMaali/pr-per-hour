<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Notifications;

use App\Features\ContactMessages\Models\ContactMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class ContactInquiryReceivedNotification extends Notification
{
    public function __construct(
        public readonly ContactMessage $contactMessage,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = $this->contactMessage;

        $mail = (new MailMessage)
            ->subject('New website inquiry from '.$message->full_name)
            ->replyTo($message->email, $message->full_name)
            ->greeting('New website inquiry')
            ->line('A new inquiry was submitted through prperhour.com.')
            ->line('Name: '.$message->full_name)
            ->line('Email: '.$message->email);

        if (is_string($message->phone) && trim($message->phone) !== '') {
            $mail->line('Phone: '.$message->phone);
        }

        if (
            is_string($message->organization)
            && trim($message->organization) !== ''
        ) {
            $mail->line('Organization: '.$message->organization);
        }

        $mail
            ->line('Message:')
            ->line($message->message)
            ->line(
                'Submitted at: '.
                ($message->created_at?->format('Y-m-d H:i:s') ?? 'Unknown')
            )
            ->salutation('PR Per Hour Website');

        return $mail;
    }
}