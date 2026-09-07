<?php

declare(strict_types=1);

use App\Features\Chatbot\Controllers\PublicChatbotController;
use Illuminate\Support\Facades\Route;

Route::prefix('chatbot')
    ->middleware('throttle:chatbot')
    ->group(static function (): void {
        Route::post(
            '/conversations',
            [PublicChatbotController::class, 'store'],
        )->name('api.v1.chatbot.conversations.store');

        Route::get(
            '/conversations/{conversationToken}',
            [PublicChatbotController::class, 'show'],
        )
            ->where('conversationToken', '[A-Za-z0-9_-]+')
            ->name('api.v1.chatbot.conversations.show');

        Route::post(
            '/conversations/{conversationToken}/messages',
            [PublicChatbotController::class, 'storeMessage'],
        )
            ->where('conversationToken', '[A-Za-z0-9_-]+')
            ->name('api.v1.chatbot.messages.store');

        Route::post(
            '/conversations/{conversationToken}/messages/stream',
            [PublicChatbotController::class, 'streamMessage'],
        )
            ->where('conversationToken', '[A-Za-z0-9_-]+')
            ->name('api.v1.chatbot.messages.stream');
    });
