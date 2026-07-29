<?php

declare(strict_types=1);

namespace App\Features\Services\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class UpdateServiceRequest extends FormRequest
{
    /** @var list<string> */
    private const FORBIDDEN_FIELDS = [
        'id',
        'is_active',
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    public function authorize(): bool
    {
        $service = $this->route('service');

        return $this->user()?->can('update', $service) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('slug') && is_string($this->input('slug'))) {
            $this->merge([
                'slug' => Str::slug(trim($this->input('slug'))),
            ]);
        }

        if ($this->has('currency') && is_string($this->input('currency'))) {
            $this->merge([
                'currency' => strtoupper(trim($this->input('currency'))),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $service = $this->route('service');
        $serviceId = is_object($service) ? $service->id : null;

        return [
            'category_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('service_categories', 'id')->whereNull('deleted_at'),
            ],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('services', 'slug')->ignore($serviceId),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
            'duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'price' => ['sometimes', 'numeric', 'min:0', 'max:99999999.99'],
            'currency' => ['sometimes', 'required', 'string', 'max:10', 'regex:/^[A-Z0-9]+$/'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $payload = $this->all();

            foreach (self::FORBIDDEN_FIELDS as $field) {
                if (array_key_exists($field, $payload)) {
                    $validator->errors()->add($field, __('services.forbidden_field_update'));
                }
            }

            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $allowed = ['category_id', 'title', 'slug', 'description', 'duration_minutes', 'price', 'currency'];
            $hasAllowed = false;
            foreach ($allowed as $field) {
                if (array_key_exists($field, $payload)) {
                    $hasAllowed = true;
                    break;
                }
            }

            if (! $hasAllowed) {
                $validator->errors()->add('service', __('services.no_update_fields'));
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'category_id' => __('services.attributes.category_id'),
            'title' => __('services.attributes.title'),
            'slug' => __('services.attributes.slug'),
            'description' => __('services.attributes.description'),
            'duration_minutes' => __('services.attributes.duration_minutes'),
            'price' => __('services.attributes.price'),
            'currency' => __('services.attributes.currency'),
        ];
    }
}
