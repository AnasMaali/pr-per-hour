<?php

declare(strict_types=1);

namespace App\Features\Services\Models;

use App\Features\Bookings\Models\Booking;
use App\Features\ServiceCategories\Models\ServiceCategory;
use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'description',
        'duration_minutes',
        'price',
        'currency',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    protected static function newFactory(): ServiceFactory
    {
        return ServiceFactory::new();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * @param  Builder<Service>  $query
     * @return Builder<Service>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('services.is_active', true);
    }

    /**
     * Public catalog visibility: active service under an active, non-deleted category.
     *
     * @param  Builder<Service>  $query
     * @return Builder<Service>
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query
            ->active()
            ->whereHas('category', static function (Builder $categoryQuery): void {
                $categoryQuery->where('is_active', true);
            });
    }

    /**
     * @param  Builder<Service>  $query
     * @return Builder<Service>
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
                ->where('services.title', 'like', $like)
                ->orWhere('services.slug', 'like', $like)
                ->orWhere('services.description', 'like', $like);
        });
    }

    /**
     * @param  Builder<Service>  $query
     * @return Builder<Service>
     */
    public function scopeFilterActive(Builder $query, ?bool $isActive): Builder
    {
        if ($isActive === null) {
            return $query;
        }

        return $query->where('services.is_active', $isActive);
    }

    /**
     * @param  Builder<Service>  $query
     * @return Builder<Service>
     */
    public function scopeFilterCategoryId(Builder $query, ?int $categoryId): Builder
    {
        if ($categoryId === null) {
            return $query;
        }

        return $query->where('services.category_id', $categoryId);
    }

    /**
     * @param  Builder<Service>  $query
     * @return Builder<Service>
     */
    public function scopeFilterCategorySlug(Builder $query, ?string $slug): Builder
    {
        if ($slug === null || trim($slug) === '') {
            return $query;
        }

        return $query->whereHas('category', static function (Builder $categoryQuery) use ($slug): void {
            $categoryQuery->where('slug', trim($slug));
        });
    }

    /**
     * @param  Builder<Service>  $query
     * @return Builder<Service>
     */
    public function scopeFilterCurrency(Builder $query, ?string $currency): Builder
    {
        if ($currency === null || trim($currency) === '') {
            return $query;
        }

        return $query->where('services.currency', strtoupper(trim($currency)));
    }

    /**
     * @param  Builder<Service>  $query
     * @return Builder<Service>
     */
    public function scopeFilterDuration(Builder $query, ?int $durationMinutes): Builder
    {
        if ($durationMinutes === null) {
            return $query;
        }

        return $query->where('services.duration_minutes', $durationMinutes);
    }

    /**
     * @param  Builder<Service>  $query
     * @return Builder<Service>
     */
    public function scopeFilterPriceRange(Builder $query, ?string $minPrice, ?string $maxPrice): Builder
    {
        if ($minPrice !== null && $minPrice !== '') {
            $query->where('services.price', '>=', $minPrice);
        }

        if ($maxPrice !== null && $maxPrice !== '') {
            $query->where('services.price', '<=', $maxPrice);
        }

        return $query;
    }
}
