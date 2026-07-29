<?php

declare(strict_types=1);

namespace App\Features\Users\Requests;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Features\Users\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class AdminUserIndexRequest extends FormRequest
{
    /** @var list<string> */
    public const SORTABLE = ['id', 'name', 'email', 'created_at', 'updated_at'];

    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', User::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'role' => ['sometimes', 'nullable', Rule::enum(UserRole::class)],
            'status' => ['sometimes', 'nullable', Rule::enum(UserStatus::class)],
            'sort' => ['sometimes', 'string', Rule::in(self::SORTABLE)],
            'direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
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
