<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Models;

use App\Enums\ChatSender;
use Database\Factories\ChatMessageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    /** @use HasFactory<ChatMessageFactory> */
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender',
        'message',
    ];

    protected function casts(): array
    {
        return [
            'sender' => ChatSender::class,
        ];
    }

    protected static function newFactory(): ChatMessageFactory
    {
        return ChatMessageFactory::new();
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatConversation::class, 'conversation_id');
    }
}
