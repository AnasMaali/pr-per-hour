<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Providers;

use App\Features\Chatbot\Contracts\ChatProvider;
use App\Features\Chatbot\DTOs\ChatProviderRequest;
use App\Features\Chatbot\DTOs\ChatProviderResult;

/**
 * Local, offline substitute for a real AI provider. Keeps Anas useful
 * whenever no provider is configured, the configured provider fails, or
 * its response fails the quality guard. Must never throw: this is the
 * last line of defense before the visitor sees an error.
 *
 * The reply must never hint that an external AI provider was involved,
 * failed, or is unavailable — from the visitor's perspective this is
 * simply Anas answering. Provider fallback is an internal implementation
 * detail, not a frontend-facing error.
 *
 * It's also conversation-aware: it only introduces/greets when this is
 * effectively the first turn. Re-greeting mid-conversation would make the
 * fallback obvious and jarring, so a later turn gets a grounded,
 * no-nonsense response instead — one that doesn't pretend to have
 * understood the specific question, since this path never saw it.
 */
final class FallbackChatProvider implements ChatProvider
{
    public function generate(ChatProviderRequest $request): ChatProviderResult
    {
        $company = (array) config('chatbot.company', []);
        $assistantName = (string) config('chatbot.assistant.name', 'Anas');

        $isArabic = $this->latestMessageLooksArabic($request);
        $isFirstInteraction = $this->isFirstInteraction($request);

        $content = $isArabic
            ? $this->arabicReply($assistantName, $company, $isFirstInteraction)
            : $this->englishReply($assistantName, $company, $isFirstInteraction);

        return new ChatProviderResult(
            content: $content,
            provider: 'fallback',
            model: null,
            fallbackUsed: true,
            usage: null,
        );
    }

    private function latestMessageLooksArabic(ChatProviderRequest $request): bool
    {
        $lastUserMessage = null;

        foreach (array_reverse($request->history) as $historyMessage) {
            if ($historyMessage->role === 'user') {
                $lastUserMessage = $historyMessage->content;

                break;
            }
        }

        if ($lastUserMessage === null) {
            return false;
        }

        return (bool) preg_match('/\p{Arabic}/u', $lastUserMessage);
    }

    /**
     * "First interaction" means no prior assistant turn exists yet in the
     * bounded history — i.e. Anas hasn't said anything in this
     * conversation so far, so a greeting/introduction is still natural.
     */
    private function isFirstInteraction(ChatProviderRequest $request): bool
    {
        foreach ($request->history as $historyMessage) {
            if ($historyMessage->role === 'assistant') {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $company
     */
    private function englishReply(string $assistantName, array $company, bool $isFirstInteraction): string
    {
        $name = (string) ($company['name'] ?? 'PR Per Hour');
        $website = (string) ($company['website'] ?? '');
        $email = (string) ($company['email'] ?? '');

        if (! $isFirstInteraction) {
            return trim(sprintf(
                "Based on what's available, I can still help you get to know %s's services and find ".
                "the right fit. We offer strategic communication, public relations, training and ".
                "capacity building, and data, AI & technology services.\n\n".
                'Tell me more about the specific details you need, and I\'ll help you pick the right '.
                'service. You can also explore more at %s or reach us at %s.',
                $name,
                $website,
                $email,
            ));
        }

        return trim(sprintf(
            "Hi, I'm %s! I can help you get to know %s's services and find the right fit for ".
            'your needs. We offer strategic communication, public relations, training and capacity '.
            "building, and data, AI & technology services.\n\n".
            'Tell me a bit about what you need or the goal you\'re trying to reach, and I\'ll help '.
            "you pick the right service. You can also explore more at %s or reach us at %s.",
            $assistantName,
            $name,
            $website,
            $email,
        ));
    }

    /**
     * @param  array<string, mixed>  $company
     */
    private function arabicReply(string $assistantName, array $company, bool $isFirstInteraction): string
    {
        $name = (string) ($company['name'] ?? 'PR Per Hour');
        $website = (string) ($company['website'] ?? '');
        $email = (string) ($company['email'] ?? '');

        if (! $isFirstInteraction) {
            return trim(sprintf(
                'بناءً على المعلومات المتاحة، ما زلت أقدر أساعدك في التعرف على خدمات %s '.
                "واختيار الخدمة الأقرب لاحتياجك. تشمل خدماتنا الاتصال الاستراتيجي، والعلاقات العامة، ".
                "والتدريب وبناء القدرات، إضافة إلى خدمات البيانات والذكاء الاصطناعي والتكنولوجيا.\n\n".
                'احكيلي أكتر عن التفاصيل المحددة يلي بتحتاجها، وبساعدك تختار الخدمة المناسبة. '.
                'يمكنك أيضًا تصفح خدماتنا عبر %s أو التواصل معنا عبر %s.',
                $name,
                $website,
                $email,
            ));
        }

        return trim(sprintf(
            "أهلاً! أنا %s، ويمكنني مساعدتك في التعرف على خدمات %s واختيار الخدمة الأقرب ".
            'لاحتياجك. تشمل خدماتنا الاتصال الاستراتيجي، والعلاقات العامة، والتدريب وبناء '.
            "القدرات، إضافة إلى خدمات البيانات والذكاء الاصطناعي والتكنولوجيا.\n\n".
            'احكيلي شو احتياجك أو الهدف اللي بتحاول توصله، وبساعدك أختار الخدمة المناسبة. '.
            'يمكنك أيضًا تصفح خدماتنا عبر %s أو التواصل معنا عبر %s.',
            $assistantName,
            $name,
            $website,
            $email,
        ));
    }
}
