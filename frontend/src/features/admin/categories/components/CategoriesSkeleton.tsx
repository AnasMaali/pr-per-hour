import { useTranslation } from 'react-i18next'

export function CategoriesSkeleton() {
  const { t } = useTranslation('adminCategories')

  return (
    <div className="categories-skeleton" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">{t('loading')}</span>
      <div className="categories-skeleton__row" />
      <div className="categories-skeleton__row" />
      <div className="categories-skeleton__row" />
    </div>
  )
}
