<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Requests;

use App\Features\ServiceCategories\Models\ServiceCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class AdminIndexServiceCategoryRequest extends FormRequest
{
    /** @var list<string> */
    public const SORTABLE = ['id', 'name', 'created_at', 'updated_at'];

    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', ServiceCategory::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'nullable', 'boolean'],
            'sort' => ['sometimes', 'string', Rule::in(self::SORTABLE)],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'search' => __('service_categories.attributes.search'),
            'is_active' => __('service_categories.attributes.is_active'),
            'sort' => __('service_categories.attributes.sort'),
            'direction' => __('service_categories.attributes.direction'),
            'per_page' => __('service_categories.attributes.per_page'),
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
