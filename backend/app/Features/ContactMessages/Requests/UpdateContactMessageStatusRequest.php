<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Requests;

use App\Enums\ContactMessageStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateContactMessageStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $contactMessage = $this->route('contactMessage');

        return $this->user()?->can('updateStatus', $contactMessage) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::enum(ContactMessageStatus::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'status' => __('contact_messages.attributes.status'),
        ];
    }
}
