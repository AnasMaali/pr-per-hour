<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('USD');
            $table->string('payment_method', 50)->nullable();
            $table->string('transaction_id', 255)->nullable();
            $table->string('status', 50)->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->softDeletes();

            $table->foreign('booking_id', 'fk_payments_booking')
                ->references('id')
                ->on('bookings')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->index('booking_id', 'idx_payments_booking_id');
            $table->index('status', 'idx_payments_status');
            $table->index('transaction_id', 'idx_payments_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
