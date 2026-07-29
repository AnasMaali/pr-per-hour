<?php

declare(strict_types=1);

namespace Tests\Support;

/**
 * Authoritative column sets from PR_Per_Hour_SQL.txt.
 * Tests fail if unauthorized columns are added to client domain tables.
 */
final class ClientSchemaManifest
{
    /**
     * @return list<string>
     */
    public static function domainTables(): array
    {
        return [
            'users',
            'service_categories',
            'services',
            'bookings',
            'payments',
            'invoices',
            'chat_conversations',
            'chat_messages',
            'contact_messages',
        ];
    }

    /**
     * @return array<string, list<string>>
     */
    public static function columnsByTable(): array
    {
        return [
            'users' => [
                'id', 'name', 'email', 'email_verified_at', 'phone', 'password', 'role', 'status',
                'created_at', 'updated_at', 'deleted_at',
            ],
            'service_categories' => [
                'id', 'name', 'slug', 'description', 'is_active',
                'created_at', 'updated_at', 'deleted_at',
            ],
            'services' => [
                'id', 'category_id', 'title', 'slug', 'description',
                'duration_minutes', 'price', 'currency', 'is_active',
                'created_at', 'updated_at', 'deleted_at',
            ],
            'bookings' => [
                'id', 'user_id', 'service_id', 'booking_date', 'start_time', 'end_time',
                'status', 'notes', 'meeting_link',
                'created_at', 'updated_at', 'deleted_at',
            ],
            'payments' => [
                'id', 'booking_id', 'amount', 'currency', 'payment_method',
                'transaction_id', 'status', 'paid_at',
                'created_at', 'updated_at', 'deleted_at',
            ],
            'invoices' => [
                'id', 'booking_id', 'invoice_number', 'total', 'currency', 'status',
                'issued_at', 'paid_at', 'created_at', 'updated_at', 'deleted_at',
            ],
            'chat_conversations' => [
                'id', 'user_id', 'visitor_name', 'visitor_email', 'status',
                'created_at', 'updated_at', 'deleted_at',
            ],
            'chat_messages' => [
                'id', 'conversation_id', 'sender', 'message',
                'created_at', 'updated_at',
            ],
            'contact_messages' => [
                'id', 'full_name', 'email', 'phone', 'organization', 'message', 'status',
                'created_at', 'updated_at', 'deleted_at',
            ],
        ];
    }

    /**
     * Tables that must not exist as domain additions.
     *
     * @return list<string>
     */
    public static function unauthorizedDomainTables(): array
    {
        return [
            'service_category_translations',
            'service_translations',
            'roles',
            'permissions',
            'invoice_items',
            'booking_availabilities',
            'consultants',
            'locales',
            'translations',
            'audit_logs',
            'settings',
            'notifications',
        ];
    }

    /**
     * Columns that must never appear on client domain tables.
     *
     * @return list<string>
     */
    public static function unauthorizedColumns(): array
    {
        return [
            'remember_token',
            'locale',
            'short_description',
            'metadata',
            'gateway',
            'pdf_path',
            'tax',
            'discount',
        ];
    }
}
