# Model Relationships

Relationships are limited to foreign keys defined in `PR_Per_Hour_SQL.txt`.

| Model | Relationship | Related model | FK |
| --- | --- | --- | --- |
| User | hasMany | Booking | `bookings.user_id` |
| User | hasMany | ChatConversation | `chat_conversations.user_id` (nullable) |
| ServiceCategory | hasMany | Service | `services.category_id` |
| Service | belongsTo | ServiceCategory | `services.category_id` |
| Service | hasMany | Booking | `bookings.service_id` |
| Booking | belongsTo | User | `bookings.user_id` |
| Booking | belongsTo | Service | `bookings.service_id` |
| Booking | hasMany | Payment | `payments.booking_id` |
| Booking | hasOne | Invoice | `invoices.booking_id` (unique) |
| Payment | belongsTo | Booking | `payments.booking_id` |
| Invoice | belongsTo | Booking | `invoices.booking_id` |
| ChatConversation | belongsTo | User | `chat_conversations.user_id` (nullable) |
| ChatConversation | hasMany | ChatMessage | `chat_messages.conversation_id` |
| ChatMessage | belongsTo | ChatConversation | `chat_messages.conversation_id` |
| ContactMessage | — | — | no FKs |

## Model locations

| Table | Model |
| --- | --- |
| users | `App\Features\Users\Models\User` |
| service_categories | `App\Features\ServiceCategories\Models\ServiceCategory` |
| services | `App\Features\Services\Models\Service` |
| bookings | `App\Features\Bookings\Models\Booking` |
| payments | `App\Features\Payments\Models\Payment` |
| invoices | `App\Features\Invoices\Models\Invoice` |
| chat_conversations | `App\Features\Chatbot\Models\ChatConversation` |
| chat_messages | `App\Features\Chatbot\Models\ChatMessage` |
| contact_messages | `App\Features\ContactMessages\Models\ContactMessage` |

## Enum casts

Application-level backed string enums map to existing `VARCHAR` columns. They do not change the database schema.
