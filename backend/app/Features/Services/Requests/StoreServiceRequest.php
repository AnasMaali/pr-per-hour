<?php

declare(strict_types=1);

namespace App\Features\Services\Requests;

use App\Features\Services\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Service::class) ?? false;
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
        return [
            'category_id' => [
                'required',
                'integer',
                Rule::exists('service_categories', 'id')->whereNull('deleted_at'),
            ],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('services', 'slug'),
            ],
            'description' => ['nullable', 'string'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'price' => ['sometimes', 'numeric', 'min:0', 'max:99999999.99'],
            'currency' => ['sometimes', 'string', 'max:10', 'regex:/^[A-Z0-9]+$/'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->exists('currency') && trim((string) $this->input('currency')) === '') {
                $validator->errors()->add('currency', __('validation.required', [
                    'attribute' => __('services.attributes.currency'),
                ]));
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
            'is_active' => __('services.attributes.is_active'),
        ];
    }
}
