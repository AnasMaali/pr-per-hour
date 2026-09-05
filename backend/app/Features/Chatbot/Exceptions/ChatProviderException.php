<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Exceptions;

use RuntimeException;

/**
 * Signals that a concrete AI provider could not produce a reply
 * (missing configuration, network failure, unexpected response, etc.).
 * Caught by ChatProviderManager, which falls back safely.
 */
final class ChatProviderException extends RuntimeException {}
