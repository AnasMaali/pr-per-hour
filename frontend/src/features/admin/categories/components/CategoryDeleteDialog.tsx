import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { CategoryDialogShell } from '@/features/admin/categories/components/CategoryDialogShell'
import type { AdminCategory } from '@/features/admin/categories/types/adminCategories.types'

interface CategoryDeleteDialogProps {
  open: boolean
  category: AdminCategory | null
  pending: boolean
  errorMessage: string | null
  requestId: string | null
  onConfirm: () => void
  onClose: () => void
}

export function CategoryDeleteDialog({
  open,
  category,
  pending,
  errorMessage,
  requestId,
  onConfirm,
  onClose,
}: CategoryDeleteDialogProps) {
  const { t } = useTranslation('adminCategories')

  return (
    <CategoryDialogShell
      open={open}
      pending={pending}
      title={t('deleteTitle')}
      description={t('deleteDescription', {
        name: category?.name ?? '',
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
          <Button type="button" className="btn--danger" disabled={pending} onClick={onConfirm}>
            {pending ? t('deleting') : t('delete')}
          </Button>
        </>
      }
    >
      <p className="category-dialog-note">{t('softDeleteNote')}</p>
      {errorMessage ? (
        <div className="category-form-error" role="alert">
          <p>{errorMessage}</p>
          {requestId ? (
            <p className="category-form-error__meta">
              {t('requestId')}: <code>{requestId}</code>
            </p>
          ) : null}
        </div>
      ) : null}
    </CategoryDialogShell>
  )
}
