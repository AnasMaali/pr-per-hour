import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { CategoryStatusBadge } from '@/features/admin/categories/components/CategoryStatusBadge'
import { formatCategoryDate } from '@/features/admin/categories/utils/categoryFormatting'
import type { AdminCategory } from '@/features/admin/categories/types/adminCategories.types'

interface CategoriesTableProps {
  categories: AdminCategory[]
  onEdit: (category: AdminCategory) => void
  onDelete: (category: AdminCategory) => void
}

export function CategoriesTable({
  categories,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const { t, i18n } = useTranslation('adminCategories')

  return (
    <>
      <div className="categories-table-wrap">
        <table className="categories-table">
          <thead>
            <tr>
              <th scope="col">{t('name')}</th>
              <th scope="col">{t('slug')}</th>
              <th scope="col">{t('status')}</th>
              <th scope="col">{t('updated')}</th>
              <th scope="col">
                <span className="visually-hidden">{t('actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className="categories-table__name">
                    <strong>{category.name}</strong>
                    {category.description ? (
                      <p>{category.description}</p>
                    ) : null}
                  </div>
                </td>
                <td>
                  <code>{category.slug}</code>
                </td>
                <td>
                  <CategoryStatusBadge isActive={category.is_active} />
                </td>
                <td>{formatCategoryDate(category.updated_at, i18n.language)}</td>
                <td>
                  <div className="categories-table__actions">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onEdit(category)}
                    >
                      {t('edit')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="btn--danger"
                      onClick={() => onDelete(category)}
                    >
                      {t('delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="categories-card-list">
        {categories.map((category) => (
          <li key={category.id} className="category-card">
            <div className="category-card__header">
              <p className="category-card__title">{category.name}</p>
              <CategoryStatusBadge isActive={category.is_active} />
            </div>
            <p className="category-card__slug">
              <code>{category.slug}</code>
            </p>
            {category.description ? (
              <p className="category-card__description">{category.description}</p>
            ) : (
              <p className="category-card__description category-card__description--empty">
                {t('noDescription')}
              </p>
            )}
            <p className="category-card__meta">
              {t('updated')}:{' '}
              {formatCategoryDate(category.updated_at, i18n.language)}
            </p>
            <div className="category-card__actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onEdit(category)}
              >
                {t('edit')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="btn--danger"
                onClick={() => onDelete(category)}
              >
                {t('delete')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
