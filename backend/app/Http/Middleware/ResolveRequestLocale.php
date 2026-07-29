<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\Localization\LocaleResolver;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

final class ResolveRequestLocale
{
    public const ATTRIBUTE = 'locale';

    public function __construct(
        private readonly LocaleResolver $localeResolver,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->localeResolver->resolve($request);

        App::setLocale($locale);
        $request->attributes->set(self::ATTRIBUTE, $locale);

        /** @var Response $response */
        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }
}
