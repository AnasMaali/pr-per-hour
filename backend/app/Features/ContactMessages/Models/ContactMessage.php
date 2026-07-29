<?php

declare(strict_types=1);

namespace App\Features\ContactMessages\Models;

use App\Enums\ContactMessageStatus;
use Database\Factories\ContactMessageFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactMessage extends Model
{
    /** @use HasFactory<ContactMessageFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Status is assigned explicitly in trusted Actions only.
     *
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'organization',
        'message',
    ];

    protected function casts(): array
    {
        return [
            'status' => ContactMessageStatus::class,
        ];
    }

    protected static function newFactory(): ContactMessageFactory
    {
        return ContactMessageFactory::new();
    }

    /**
     * @param  Builder<ContactMessage>  $query
     * @return Builder<ContactMessage>
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || trim($term) === '') {
            return $query;
        }

        $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], trim($term));
        $like = '%'.$escaped.'%';

        return $query->where(function (Builder $builder) use ($like): void {
            $builder
                ->where('full_name', 'like', $like)
                ->orWhere('email', 'like', $like)
                ->orWhere('phone', 'like', $like)
                ->orWhere('organization', 'like', $like)
                ->orWhere('message', 'like', $like);
        });
    }

    /**
     * @param  Builder<ContactMessage>  $query
     * @return Builder<ContactMessage>
     */
    public function scopeFilterStatus(Builder $query, ?string $status): Builder
    {
        if ($status === null || trim($status) === '') {
            return $query;
        }

        return $query->where('status', trim($status));
    }

    /**
     * @param  Builder<ContactMessage>  $query
     * @return Builder<ContactMessage>
     */
    public function scopeFilterEmail(Builder $query, ?string $email): Builder
    {
        if ($email === null || trim($email) === '') {
            return $query;
        }

        return $query->where('email', strtolower(trim($email)));
    }

    /**
     * @param  Builder<ContactMessage>  $query
     * @return Builder<ContactMessage>
     */
    public function scopeFilterOrganization(Builder $query, ?string $organization): Builder
    {
        if ($organization === null || trim($organization) === '') {
            return $query;
        }

        $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], trim($organization));

        return $query->where('organization', 'like', '%'.$escaped.'%');
    }

    /**
     * @param  Builder<ContactMessage>  $query
     * @return Builder<ContactMessage>
     */
    public function scopeFilterCreatedBetween(Builder $query, ?string $from, ?string $to): Builder
    {
        if ($from !== null && $from !== '') {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to !== null && $to !== '') {
            $query->whereDate('created_at', '<=', $to);
        }

        return $query;
    }
}
