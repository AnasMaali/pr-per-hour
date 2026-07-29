import { useTranslation } from 'react-i18next'
import { LoaderCircle } from 'lucide-react'

export function PageLoader({ label }: { label?: string }) {
  const { t } = useTranslation('common')
  const text = label ?? t('loading')

  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="loader">
        <LoaderCircle aria-hidden="true" size={20} />
        <span>{text}</span>
      </div>
    </div>
  )
}
