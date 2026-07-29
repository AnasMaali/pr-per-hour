<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateServiceCategoryStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $category = $this->route('serviceCategory');

        return $this->user()?->can('update', $category) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'is_active' => __('service_categories.attributes.is_active'),
        ];
    }
}
