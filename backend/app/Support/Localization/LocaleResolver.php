<?php

declare(strict_types=1);

namespace App\Support\Localization;

use Illuminate\Http\Request;

final class LocaleResolver
{
    public function resolve(Request $request): string
    {
        $supported = config('localization.supported_locales', ['en', 'ar']);
        $fallback = (string) config('localization.fallback_locale', 'en');
        $headerName = (string) config('localization.locale_header', 'X-Locale');

        $explicit = $request->headers->get($headerName);
        if (is_string($explicit)) {
            $normalized = $this->normalizeLocale($explicit);
            if ($normalized !== null && in_array($normalized, $supported, true)) {
                return $normalized;
            }
        }

        if ((bool) config('localization.accept_language_enabled', true)) {
            $fromAccept = $this->localeFromAcceptLanguage(
                (string) $request->headers->get('Accept-Language', ''),
                $supported,
            );

            if ($fromAccept !== null) {
                return $fromAccept;
            }
        }

        return in_array($fallback, $supported, true) ? $fallback : 'en';
    }

    private function normalizeLocale(string $value): ?string
    {
        $value = strtolower(trim($value));

        if ($value === '' || strlen($value) > 35) {
            return null;
        }

        if (! preg_match('/^[a-z]{2,3}([-_][a-z0-9]{2,8})*$/i', $value)) {
            return null;
        }

        $primary = strtok(str_replace('_', '-', $value), '-');

        return is_string($primary) && $primary !== '' ? $primary : null;
    }

    /**
     * @param  list<string>  $supported
     */
    private function localeFromAcceptLanguage(string $header, array $supported): ?string
    {
        if (trim($header) === '') {
            return null;
        }

        $parts = array_map('trim', explode(',', $header));

        foreach ($parts as $part) {
            $tag = trim(explode(';', $part)[0]);
            $normalized = $this->normalizeLocale($tag);

            if ($normalized !== null && in_array($normalized, $supported, true)) {
                return $normalized;
            }
        }

        return null;
    }
}
