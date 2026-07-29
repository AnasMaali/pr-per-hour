<?php

declare(strict_types=1);

namespace App\Features\Services\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateServiceStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $service = $this->route('service');

        return $this->user()?->can('update', $service) ?? false;
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
            'is_active' => __('services.attributes.is_active'),
        ];
    }
}
