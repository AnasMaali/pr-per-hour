<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 255);
            $table->string('email', 255);
            $table->string('phone', 50)->nullable();
            $table->string('organization', 255)->nullable();
            $table->text('message');
            $table->string('status', 50)->default('new');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->softDeletes();

            $table->index('email', 'idx_contact_messages_email');
            $table->index('status', 'idx_contact_messages_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};
