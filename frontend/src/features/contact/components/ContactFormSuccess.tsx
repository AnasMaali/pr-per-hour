import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import type { ContactMessageReceipt } from '@/features/contact/types/contact.types'

interface ContactFormSuccessProps {
  receipt: ContactMessageReceipt
  onSendAnother: () => void
}

export function ContactFormSuccess({
  receipt,
  onSendAnother,
}: ContactFormSuccessProps) {
  const { t } = useTranslation('contact')

  return (
    <section
      className="contact-success"
      aria-labelledby="contact-success-heading"
      tabIndex={-1}
      id="contact-success"
    >
      <div className="contact-success__panel" role="status" aria-live="polite">
        <h2 id="contact-success-heading">{t('successTitle')}</h2>
        <p>{t('successBody')}</p>
        <p className="contact-success__reference">
          {t('successReference', { id: receipt.id })}
        </p>
      </div>
      <div className="contact-success__actions">
        <Button type="button" onClick={onSendAnother}>
          {t('sendAnother')}
        </Button>
        <Link className="btn btn--secondary" to="/services">
          {t('backToServices')}
        </Link>
        <Link className="btn btn--ghost" to="/">
          {t('backToHome')}
        </Link>
      </div>
    </section>
  )
}
