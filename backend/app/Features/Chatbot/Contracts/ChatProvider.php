<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Contracts;

use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\DTOs\ChatProviderResult;

/**
 * Isolation boundary between the chatbot's business logic and any
 * concrete AI vendor. Business logic (HandleChatTurn, the controller)
 * must depend only on this contract, never on a specific vendor.
 */
interface ChatProvider
{
    public function generate(ChatProviderRequest $request): ChatProviderResult;
}
