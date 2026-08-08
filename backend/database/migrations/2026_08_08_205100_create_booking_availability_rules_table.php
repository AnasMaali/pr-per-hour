<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_availability_rules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('calendar_id')
                ->constrained('booking_calendars')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('day_of_week');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(
                ['calendar_id', 'day_of_week', 'is_active'],
                'idx_booking_availability_rules_lookup'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_availability_rules');
    }
};
