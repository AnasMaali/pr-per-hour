import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { ContactMessageDialogShell } from '@/features/admin/contact-messages/components/ContactMessageDialogShell'
import type { AdminContactMessage } from '@/features/admin/contact-messages/types/adminContactMessages.types'

interface ContactMessageDeleteDialogProps {
  open: boolean
  message: AdminContactMessage | null
  pending: boolean
  errorMessage: string | null
  requestId: string | null
  onConfirm: () => void
  onClose: () => void
}

export function ContactMessageDeleteDialog({
  open,
  message,
  pending,
  errorMessage,
  requestId,
  onConfirm,
  onClose,
}: ContactMessageDeleteDialogProps) {
  const { t } = useTranslation('adminContactMessages')

  return (
    <ContactMessageDialogShell
      open={open}
      pending={pending}
      title={t('deleteTitle')}
      description={t('deleteDescription', {
        name: message?.full_name ?? '',
        email: message?.email ?? '',
      })}
      onClose={onClose}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={onClose}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            className="btn--danger"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? t('deleting') : t('delete')}
          </Button>
        </>
      }
    >
      <p className="contact-dialog-note">{t('softDeleteNote')}</p>
      {errorMessage ? (
        <div className="contact-form-error" role="alert">
          <p>{errorMessage}</p>
          {requestId ? (
            <p className="contact-form-error__meta">
              {t('requestId')}: <code>{requestId}</code>
            </p>
          ) : null}
        </div>
      ) : null}
    </ContactMessageDialogShell>
  )
}
