<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('visitor_name', 255)->nullable();
            $table->string('visitor_email', 255)->nullable();
            $table->string('status', 50)->default('open');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->softDeletes();

            $table->foreign('user_id', 'fk_chat_conversations_user')
                ->references('id')
                ->on('users')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->index('user_id', 'idx_chat_conversations_user_id');
            $table->index('status', 'idx_chat_conversations_status');
            $table->index('visitor_email', 'idx_chat_conversations_visitor_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_conversations');
    }
};
