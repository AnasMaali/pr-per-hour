<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('service_id');
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('status', 50)->default('pending');
            $table->text('notes')->nullable();
            $table->string('meeting_link', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->softDeletes();

            $table->foreign('user_id', 'fk_bookings_user')
                ->references('id')
                ->on('users')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('service_id', 'fk_bookings_service')
                ->references('id')
                ->on('services')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->index('user_id', 'idx_bookings_user_id');
            $table->index('service_id', 'idx_bookings_service_id');
            $table->index('status', 'idx_bookings_status');
            $table->index('booking_date', 'idx_bookings_date');
            $table->index(['booking_date', 'start_time', 'end_time'], 'idx_bookings_datetime');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
