import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { ServiceDialogShell } from '@/features/admin/services/components/ServiceDialogShell'
import type { AdminService } from '@/features/admin/services/types/adminServices.types'

interface ServiceDeleteDialogProps {
  open: boolean
  service: AdminService | null
  pending: boolean
  errorMessage: string | null
  requestId: string | null
  onConfirm: () => void
  onClose: () => void
}

export function ServiceDeleteDialog({
  open,
  service,
  pending,
  errorMessage,
  requestId,
  onConfirm,
  onClose,
}: ServiceDeleteDialogProps) {
  const { t } = useTranslation('adminServices')

  return (
    <ServiceDialogShell
      open={open}
      pending={pending}
      title={t('deleteTitle')}
      description={t('deleteDescription', {
        title: service?.title ?? '',
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
      <p className="service-dialog-note">{t('softDeleteNote')}</p>
      {errorMessage ? (
        <div className="service-form-error" role="alert">
          <p>{errorMessage}</p>
          {requestId ? (
            <p className="service-form-error__meta">
              {t('requestId')}: <code>{requestId}</code>
            </p>
          ) : null}
        </div>
      ) : null}
    </ServiceDialogShell>
  )
}
