<?php

declare(strict_types=1);

namespace App\Features\ServiceCategories\Models;

use App\Features\Services\Models\Service;
use Database\Factories\ServiceCategoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceCategory extends Model
{
    /** @use HasFactory<ServiceCategoryFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function newFactory(): ServiceCategoryFactory
    {
        return ServiceCategoryFactory::new();
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'category_id');
    }

    /**
     * @param  Builder<ServiceCategory>  $query
     * @return Builder<ServiceCategory>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * @param  Builder<ServiceCategory>  $query
     * @return Builder<ServiceCategory>
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
                ->where('name', 'like', $like)
                ->orWhere('slug', 'like', $like)
                ->orWhere('description', 'like', $like);
        });
    }

    /**
     * @param  Builder<ServiceCategory>  $query
     * @return Builder<ServiceCategory>
     */
    public function scopeFilterActive(Builder $query, ?bool $isActive): Builder
    {
        if ($isActive === null) {
            return $query;
        }

        return $query->where('is_active', $isActive);
    }
}
