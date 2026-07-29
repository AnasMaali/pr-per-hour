<?php

declare(strict_types=1);

namespace App\Features\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class UpdateProfileRequest extends FormRequest
{
    /**
     * @var list<string>
     */
    private const FORBIDDEN_FIELDS = [
        'email',
        'password',
        'password_confirmation',
        'role',
        'status',
        'id',
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $payload = $this->all();

            foreach (self::FORBIDDEN_FIELDS as $field) {
                if (array_key_exists($field, $payload)) {
                    $validator->errors()->add($field, __('auth.forbidden_field_update'));
                }
            }

            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if (! array_key_exists('name', $payload) && ! array_key_exists('phone', $payload)) {
                $validator->errors()->add('profile', __('auth.no_profile_fields'));
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => __('auth.attributes.name'),
            'phone' => __('auth.attributes.phone'),
        ];
    }
}
