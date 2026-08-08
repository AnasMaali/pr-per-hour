<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_availability_exceptions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('calendar_id')
                ->constrained('booking_calendars')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->date('date');

            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            $table->string('type', 30);
            $table->string('reason', 500)->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(
                ['calendar_id', 'date', 'is_active'],
                'idx_booking_availability_exceptions_lookup'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_availability_exceptions');
    }
};
