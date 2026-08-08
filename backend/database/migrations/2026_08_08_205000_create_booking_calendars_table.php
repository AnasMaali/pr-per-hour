<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_calendars', function (Blueprint $table) {
            $table->id();

            $table->string('slug', 100)->unique();
            $table->string('name', 255);
            $table->string('timezone', 100);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active', 'idx_booking_calendars_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_calendars');
    }
};
