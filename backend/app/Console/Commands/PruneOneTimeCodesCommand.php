<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Features\Auth\Models\OneTimeCode;
use Illuminate\Console\Command;

final class PruneOneTimeCodesCommand extends Command
{
    protected $signature = 'otp:prune
                            {--days= : Override retention days for used/expired rows}';

    protected $description = 'Delete expired and used one-time codes past the retention window';

    public function handle(): int
    {
        $days = max(1, (int) ($this->option('days') ?: config('otp.prune_after_days', 7)));
        $cutoff = now()->subDays($days);

        $deleted = OneTimeCode::query()
            ->where(function ($query) use ($cutoff): void {
                $query
                    ->where(function ($expired) use ($cutoff): void {
                        $expired
                            ->whereNull('used_at')
                            ->where('expires_at', '<', $cutoff);
                    })
                    ->orWhere(function ($used) use ($cutoff): void {
                        $used
                            ->whereNotNull('used_at')
                            ->where('used_at', '<', $cutoff);
                    });
            })
            ->delete();

        $this->info("Pruned {$deleted} one-time code row(s) older than {$days} day(s).");

        return self::SUCCESS;
    }
}
