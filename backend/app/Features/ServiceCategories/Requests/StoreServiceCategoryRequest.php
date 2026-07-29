<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Requests;

use App\Features\ServiceCategories\Models\ServiceCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class StoreServiceCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', ServiceCategory::class) ?? false;
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('service_categories', 'slug'),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
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
            'is_active' => __('service_categories.attributes.is_active'),
        ];
    }
}
