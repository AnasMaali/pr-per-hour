import { useTranslation } from 'react-i18next'
import { LoaderCircle } from 'lucide-react'

export function InlineLoader({ label }: { label?: string }) {
  const { t } = useTranslation('common')
  const text = label ?? t('loading')

  return (
    <span className="loader" role="status" aria-live="polite">
      <LoaderCircle aria-hidden="true" size={16} />
      <span>{text}</span>
    </span>
  )
}
