<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ServiceCategorySeeder::class,
        ]);

        if (filled(env('PR_ADMIN_PASSWORD'))) {
            $this->call([
                AdminUserSeeder::class,
            ]);
        }
    }
}
