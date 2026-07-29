<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Models;

use App\Enums\ChatConversationStatus;
use App\Features\Users\Models\User;
use Database\Factories\ChatConversationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatConversation extends Model
{
    /** @use HasFactory<ChatConversationFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'visitor_name',
        'visitor_email',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => ChatConversationStatus::class,
        ];
    }

    protected static function newFactory(): ChatConversationFactory
    {
        return ChatConversationFactory::new();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id');
    }
}
