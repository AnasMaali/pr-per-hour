<?php

declare(strict_types=1);

namespace App\Features\Auth\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class PasswordResetCodeNotification extends Notification
{
    /**
     * @param  non-empty-string  $plainCode  Delivery-only; never persist or log.
     */
    public function __construct(
        public readonly string $plainCode,
        public readonly int $expiresMinutes,
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
        $name = is_string($notifiable->name ?? null) && $notifiable->name !== ''
            ? $notifiable->name
            : __('auth.mail.user_fallback');

        return (new MailMessage)
            ->subject(__('auth.mail.reset_subject'))
            ->greeting(__('auth.mail.greeting', ['name' => $name]))
            ->line(__('auth.mail.reset_intro'))
            ->line(__('auth.mail.code_line', ['code' => $this->plainCode]))
            ->line(__('auth.mail.expires_line', ['minutes' => $this->expiresMinutes]))
            ->line(__('auth.mail.do_not_share'))
            ->line(__('auth.mail.ignore_if_unrequested'))
            ->salutation(__('auth.mail.salutation'));
    }
}
