<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conversation_id');
            $table->string('sender', 50);
            $table->text('message');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

            $table->foreign('conversation_id', 'fk_chat_messages_conversation')
                ->references('id')
                ->on('chat_conversations')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->index('conversation_id', 'idx_chat_messages_conversation_id');
            $table->index('sender', 'idx_chat_messages_sender');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
