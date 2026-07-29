<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class UpdateServiceCategoryRequest extends FormRequest
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
        $category = $this->route('serviceCategory');

        return $this->user()?->can('update', $category) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('slug') && is_string($this->input('slug'))) {
            $this->merge([
                'slug' => Str::slug(trim($this->input('slug'))),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $category = $this->route('serviceCategory');
        $categoryId = is_object($category) ? $category->id : null;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('service_categories', 'slug')->ignore($categoryId),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $payload = $this->all();

            foreach (self::FORBIDDEN_FIELDS as $field) {
                if (array_key_exists($field, $payload)) {
                    $validator->errors()->add($field, __('service_categories.forbidden_field_update'));
                }
            }

            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if (
                ! array_key_exists('name', $payload)
                && ! array_key_exists('slug', $payload)
                && ! array_key_exists('description', $payload)
            ) {
                $validator->errors()->add('category', __('service_categories.no_update_fields'));
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => __('service_categories.attributes.name'),
            'slug' => __('service_categories.attributes.slug'),
            'description' => __('service_categories.attributes.description'),
        ];
    }
}
