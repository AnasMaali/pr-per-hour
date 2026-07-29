<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Requests;

use App\Enums\ContactMessageStatus;
use App\Features\ContactMessages\Models\ContactMessage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

final class AdminContactMessageIndexRequest extends FormRequest
{
    /** @var list<string> */
    public const SORTABLE = ['id', 'full_name', 'email', 'status', 'created_at', 'updated_at'];

    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', ContactMessage::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email') && is_string($this->input('email'))) {
            $this->merge([
                'email' => strtolower(trim($this->input('email'))),
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
            'status' => ['sometimes', 'nullable', 'string', Rule::enum(ContactMessageStatus::class)],
            'email' => ['sometimes', 'nullable', 'string', 'email', 'max:255'],
            'organization' => ['sometimes', 'nullable', 'string', 'max:255'],
            'created_from' => ['sometimes', 'nullable', 'date'],
            'created_to' => ['sometimes', 'nullable', 'date'],
            'sort' => ['sometimes', 'string', Rule::in(self::SORTABLE)],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $from = $this->input('created_from');
            $to = $this->input('created_to');

            if ($from && $to && strtotime((string) $from) > strtotime((string) $to)) {
                $validator->errors()->add('created_from', __('contact_messages.invalid_date_range'));
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'search' => __('contact_messages.attributes.search'),
            'status' => __('contact_messages.attributes.status'),
            'email' => __('contact_messages.attributes.email'),
            'organization' => __('contact_messages.attributes.organization'),
            'created_from' => __('contact_messages.attributes.created_from'),
            'created_to' => __('contact_messages.attributes.created_to'),
            'sort' => __('contact_messages.attributes.sort'),
            'direction' => __('contact_messages.attributes.direction'),
            'per_page' => __('contact_messages.attributes.per_page'),
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
