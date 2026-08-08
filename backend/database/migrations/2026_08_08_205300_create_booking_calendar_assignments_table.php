<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_calendar_assignments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('calendar_id')
                ->constrained('booking_calendars')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(
                ['booking_id', 'calendar_id'],
                'uq_booking_calendar_assignment'
            );

            $table->index(
                'calendar_id',
                'idx_booking_calendar_assignments_calendar'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_calendar_assignments');
    }
};
