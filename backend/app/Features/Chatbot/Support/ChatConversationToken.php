<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Support;

use App\Features\Chatbot\Models\ChatConversation;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use JsonException;

final class ChatConversationToken
{
    public function issue(ChatConversation $conversation): string
    {
        $payload = json_encode(
            [
                'v' => 1,
                'conversation_id' => $conversation->getKey(),
            ],
            JSON_THROW_ON_ERROR,
        );

        $encrypted = Crypt::encryptString($payload);

        return rtrim(
            strtr(base64_encode($encrypted), '+/', '-_'),
            '=',
        );
    }

    public function resolve(string $token): ?int
    {
        try {
            $normalized = strtr($token, '-_', '+/');

            $padding = strlen($normalized) % 4;

            if ($padding !== 0) {
                $normalized .= str_repeat('=', 4 - $padding);
            }

            $encrypted = base64_decode($normalized, true);

            if ($encrypted === false) {
                return null;
            }

            $payload = json_decode(
                Crypt::decryptString($encrypted),
                true,
                512,
                JSON_THROW_ON_ERROR,
            );

            if (
                ! is_array($payload)
                || ($payload['v'] ?? null) !== 1
                || ! isset($payload['conversation_id'])
                || ! is_int($payload['conversation_id'])
                || $payload['conversation_id'] < 1
            ) {
                return null;
            }

            return $payload['conversation_id'];
        } catch (DecryptException | JsonException) {
            return null;
        }
    }
}
