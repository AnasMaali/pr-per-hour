<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class StartChatConversationRequest extends FormRequest
{
    /** @var list<string> */
    private const FORBIDDEN_FIELDS = [
        'id',
        'user_id',
        'status',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('visitor_name') && is_string($this->input('visitor_name'))) {
            $this->merge([
                'visitor_name' => trim($this->input('visitor_name')),
            ]);
        }

        if ($this->has('visitor_email') && is_string($this->input('visitor_email'))) {
            $this->merge([
                'visitor_email' => strtolower(trim($this->input('visitor_email'))),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'visitor_name' => ['nullable', 'string', 'max:255'],
            'visitor_email' => ['nullable', 'string', 'email', 'max:255'],

            // Honeypot.
            'website' => ['nullable', 'string', 'max:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach (self::FORBIDDEN_FIELDS as $field) {
                if (array_key_exists($field, $this->all())) {
                    $validator->errors()->add(
                        $field,
                        __('chatbot.forbidden_field'),
                    );
                }
            }
        });
    }
}
