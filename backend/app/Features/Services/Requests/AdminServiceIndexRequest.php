<?php

declare(strict_types=1);

namespace App\Features\Services\Requests;

use App\Features\Services\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class AdminServiceIndexRequest extends FormRequest
{
    /** @var list<string> */
    public const SORTABLE = ['id', 'title', 'price', 'duration_minutes', 'created_at', 'updated_at'];

    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Service::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
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
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'category' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'nullable', 'boolean'],
            'duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'currency' => ['sometimes', 'nullable', 'string', 'max:10'],
            'min_price' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'max_price' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'sort' => ['sometimes', 'string', Rule::in(self::SORTABLE)],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $min = $this->input('min_price');
            $max = $this->input('max_price');

            if ($min !== null && $min !== '' && $max !== null && $max !== '' && (float) $min > (float) $max) {
                $validator->errors()->add('min_price', __('services.invalid_price_range'));
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'search' => __('services.attributes.search'),
            'category_id' => __('services.attributes.category_id'),
            'category' => __('services.attributes.category'),
            'is_active' => __('services.attributes.is_active'),
            'duration_minutes' => __('services.attributes.duration_minutes'),
            'currency' => __('services.attributes.currency'),
            'min_price' => __('services.attributes.min_price'),
            'max_price' => __('services.attributes.max_price'),
            'sort' => __('services.attributes.sort'),
            'direction' => __('services.attributes.direction'),
            'per_page' => __('services.attributes.per_page'),
        ];
    }

    public function sortColumn(): string
    {
        return (string) $this->validated('sort', 'created_at');
    }

    public function sortDirection(): string
    {
        return (string) $this->validated('direction', 'desc');
    }

    public function perPage(): int
    {
        return (int) $this->validated('per_page', 15);
    }
}
