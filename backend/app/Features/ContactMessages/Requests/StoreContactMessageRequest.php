<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class StoreContactMessageRequest extends FormRequest
{
    /** Application-level safety limit for TEXT message body (not a DB column length). */
    public const MESSAGE_MAX_LENGTH = 5000;

    /** @var list<string> */
    private const FORBIDDEN_FIELDS = [
        'id',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
        'assigned_to',
        'subject',
        'locale',
        'ip',
        'ip_address',
        'user_agent',
    ];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email') && is_string($this->input('email'))) {
            $this->merge([
                'email' => strtolower(trim($this->input('email'))),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'organization' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:'.self::MESSAGE_MAX_LENGTH],
            // Honeypot: real users leave this field empty; basic bots often fill it.
            'website' => ['nullable', 'string', 'max:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach (self::FORBIDDEN_FIELDS as $field) {
                if (array_key_exists($field, $this->all())) {
                    $validator->errors()->add($field, __('contact_messages.forbidden_field'));
                }
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'full_name' => __('contact_messages.attributes.full_name'),
            'email' => __('contact_messages.attributes.email'),
            'phone' => __('contact_messages.attributes.phone'),
            'organization' => __('contact_messages.attributes.organization'),
            'message' => __('contact_messages.attributes.message'),
        ];
    }
}
