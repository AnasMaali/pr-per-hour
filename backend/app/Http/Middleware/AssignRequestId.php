<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

final class AssignRequestId
{
    public const ATTRIBUTE = 'request_id';

    public const HEADER = 'X-Request-ID';

    private const MAX_LENGTH = 64;

    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $this->resolveRequestId($request);

        $request->attributes->set(self::ATTRIBUTE, $requestId);
        Log::withContext([self::ATTRIBUTE => $requestId]);

        /** @var Response $response */
        $response = $next($request);
        $response->headers->set(self::HEADER, $requestId);

        return $response;
    }

    private function resolveRequestId(Request $request): string
    {
        $incoming = $request->headers->get(self::HEADER);

        if (is_string($incoming) && $this->isValidRequestId($incoming)) {
            return $incoming;
        }

        return (string) Str::uuid();
    }

    private function isValidRequestId(string $value): bool
    {
        $value = trim($value);

        if ($value === '' || strlen($value) > self::MAX_LENGTH) {
            return false;
        }

        return (bool) preg_match('/^[A-Za-z0-9\-]+$/', $value);
    }
}
