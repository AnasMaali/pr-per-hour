import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Select } from '@/shared/components/Select'
import { ContactMessageDialogShell } from '@/features/admin/contact-messages/components/ContactMessageDialogShell'
import type {
  AdminContactMessage,
  AdminContactMessageStatus,
} from '@/features/admin/contact-messages/types/adminContactMessages.types'

const ALL_STATUSES: AdminContactMessageStatus[] = [
  'new',
  'read',
  'replied',
  'closed',
]

interface ContactMessageStatusDialogProps {
  open: boolean
  message: AdminContactMessage | null
  pending: boolean
  errorMessage: string | null
  fieldError: string | null
  requestId: string | null
  onClose: () => void
  onSubmit: (status: AdminContactMessageStatus) => void
}

export function ContactMessageStatusDialog({
  open,
  message,
  pending,
  errorMessage,
  fieldError,
  requestId,
  onClose,
  onSubmit,
}: ContactMessageStatusDialogProps) {
  const { t } = useTranslation('adminContactMessages')
  const [nextStatus, setNextStatus] = useState<AdminContactMessageStatus>('read')

  useEffect(() => {
    if (!open || !message) return
    setNextStatus(message.status)
  }, [open, message])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (pending) return
    onSubmit(nextStatus)
  }

  return (
    <ContactMessageDialogShell
      open={open}
      pending={pending}
      title={t('statusDialogTitle')}
      description={
        message
          ? t('statusDialogDescription', {
              current: t(`status.${message.status}`),
            })
          : undefined
      }
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
            type="submit"
            form="admin-contact-status-form"
            disabled={pending}
          >
            {pending ? t('savingStatus') : t('saveStatus')}
          </Button>
        </>
      }
    >
      <form
        id="admin-contact-status-form"
        className="contact-form"
        onSubmit={handleSubmit}
        noValidate
      >
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

        <Select
          id="admin-contact-next-status"
          name="status"
          label={t('newStatus')}
          value={nextStatus}
          disabled={pending}
          error={fieldError ?? undefined}
          options={ALL_STATUSES.map((status) => ({
            value: status,
            label: t(`status.${status}`),
          }))}
          onChange={(event) =>
            setNextStatus(event.target.value as AdminContactMessageStatus)
          }
        />
      </form>
    </ContactMessageDialogShell>
  )
}
