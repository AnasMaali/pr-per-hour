<?php

declare(strict_types=1);

namespace App\Features\Chatbot\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class SendChatMessageRequest extends FormRequest
{
    public const MESSAGE_MAX_LENGTH = 2000;

    /** @var list<string> */
    private const FORBIDDEN_FIELDS = [
        'id',
        'conversation_id',
        'sender',
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
        if ($this->has('message') && is_string($this->input('message'))) {
            $this->merge([
                'message' => trim($this->input('message')),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'message' => [
                'required',
                'string',
                'max:'.self::MESSAGE_MAX_LENGTH,
            ],
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
