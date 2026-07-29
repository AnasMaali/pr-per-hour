<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->string('invoice_number', 100)->unique();
            $table->decimal('total', 10, 2);
            $table->string('currency', 10)->default('USD');
            $table->string('status', 50)->default('unpaid');
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->softDeletes();

            $table->foreign('booking_id', 'fk_invoices_booking')
                ->references('id')
                ->on('bookings')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->unique('booking_id', 'unique_invoice_booking');
            $table->index('invoice_number', 'idx_invoices_invoice_number');
            $table->index('status', 'idx_invoices_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
