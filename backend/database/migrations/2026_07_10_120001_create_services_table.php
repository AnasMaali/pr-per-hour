<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->string('currency', 10)->default('USD');
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->softDeletes();

            $table->foreign('category_id', 'fk_services_category')
                ->references('id')
                ->on('service_categories')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->index('category_id', 'idx_services_category_id');
            $table->index('slug', 'idx_services_slug');
            $table->index('is_active', 'idx_services_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
