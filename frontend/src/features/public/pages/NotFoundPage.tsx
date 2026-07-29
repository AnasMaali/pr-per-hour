import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components/PageHeader'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'

export function NotFoundPage() {
  const { t } = useTranslation('errors')

  useDocumentMeta({
    title: t('notFoundMetaTitle'),
    description: t('notFoundMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  return (
    <section className="route-placeholder">
      <PageHeader title={t('notFound')} description={t('notFoundDescription')} />
      <div className="cluster">
        <Link className="btn" to="/">
          {t('goHome')}
        </Link>
      </div>
    </section>
  )
}
