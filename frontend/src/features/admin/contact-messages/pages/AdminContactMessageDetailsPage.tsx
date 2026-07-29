import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageLoader } from '@/shared/components/PageLoader'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { ContactMessageDeleteDialog } from '@/features/admin/contact-messages/components/ContactMessageDeleteDialog'
import { ContactMessageDetailsSummary } from '@/features/admin/contact-messages/components/ContactMessageDetailsSummary'
import { ContactMessageStatusDialog } from '@/features/admin/contact-messages/components/ContactMessageStatusDialog'
import { useAdminContactMessageQuery } from '@/features/admin/contact-messages/queries/useAdminContactMessageQuery'
import { useDeleteContactMessageMutation } from '@/features/admin/contact-messages/queries/useDeleteContactMessageMutation'
import { useUpdateContactMessageStatusMutation } from '@/features/admin/contact-messages/queries/useUpdateContactMessageStatusMutation'
import type { AdminContactMessageStatus } from '@/features/admin/contact-messages/types/adminContactMessages.types'
import { mapAdminContactMessageApiError } from '@/features/admin/contact-messages/utils/mapAdminContactMessageApiError'
import '@/features/admin/contact-messages/styles/admin-contact-messages.css'

export function AdminContactMessageDetailsPage() {
  const { t, i18n } = useTranslation('adminContactMessages')
  const navigate = useNavigate()
  const { id: idParam } = useParams()
  const messageId = Number.parseInt(idParam ?? '', 10)
  const validId =
    Number.isFinite(messageId) && messageId > 0 ? messageId : null

  const messageQuery = useAdminContactMessageQuery(validId)
  const statusMutation = useUpdateContactMessageStatusMutation()
  const deleteMutation = useDeleteContactMessageMutation()

  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const message = messageQuery.data

  useDocumentMeta({
    title: message
      ? t('detailMetaTitle', { id: message.id })
      : t('detailMetaTitleFallback'),
    description: t('detailMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  const detailRequestId =
    messageQuery.error instanceof ApiClientError
      ? messageQuery.error.normalized.requestId
      : null

  const detailStatus =
    messageQuery.error instanceof ApiClientError
      ? messageQuery.error.normalized.status
      : null

  function mapError(error: unknown) {
    const mapped = mapAdminContactMessageApiError(error)
    setRequestId(mapped.requestId)
    setFieldError(mapped.fieldErrors.status ?? null)
    setDialogMessage(
      mapped.formMessageKey ? t(mapped.formMessageKey) : mapped.formMessage,
    )
  }

  async function handleStatus(status: AdminContactMessageStatus) {
    if (!message) return
    setDialogMessage(null)
    setFieldError(null)
    setRequestId(null)
    try {
      await statusMutation.mutateAsync({
        id: message.id,
        payload: { status },
      })
      setStatusOpen(false)
      setSuccessMessage(t('successStatusUpdated'))
    } catch (error) {
      mapError(error)
    }
  }

  async function handleDelete() {
    if (!message) return
    setDialogMessage(null)
    setFieldError(null)
    setRequestId(null)
    try {
      await deleteMutation.mutateAsync(message.id)
      setDeleteOpen(false)
      navigate('/admin/contact-messages', {
        replace: true,
        state: { contactMessageDeleted: true },
      })
    } catch (error) {
      mapError(error)
    }
  }

  if (validId === null) {
    return (
      <div className="admin-contact-message-details-page">
        <ErrorState
          title={t('detailNotFoundTitle')}
          description={t('detailNotFoundDescription')}
        />
        <Link className="btn btn--secondary" to="/admin/contact-messages">
          {t('backToList')}
        </Link>
      </div>
    )
  }

  if (messageQuery.isPending) {
    return <PageLoader label={t('loadingDetail')} />
  }

  if (messageQuery.isError) {
    const title =
      detailStatus === 403
        ? t('detailForbiddenTitle')
        : detailStatus === 404
          ? t('detailNotFoundTitle')
          : t('detailErrorTitle')
    const description =
      detailStatus === 403
        ? t('detailForbiddenDescription')
        : detailStatus === 404
          ? t('detailNotFoundDescription')
          : t('detailErrorDescription')

    return (
      <div className="admin-contact-message-details-page">
        <ErrorState
          title={title}
          description={description}
          requestId={detailRequestId}
          onRetry={() => {
            void messageQuery.refetch()
          }}
        />
        <Link className="btn btn--secondary" to="/admin/contact-messages">
          {t('backToList')}
        </Link>
      </div>
    )
  }

  if (!message) return null

  return (
    <div className="admin-contact-message-details-page">
      <header className="admin-contact-messages-header">
        <div>
          <p className="admin-contact-message-details-eyebrow">
            <Link to="/admin/contact-messages">{t('backToList')}</Link>
          </p>
          <h1>{t('detailTitle', { id: message.id })}</h1>
          <p>{t('detailLead')}</p>
        </div>
        <div className="admin-contact-message-details-actions">
          <Button
            type="button"
            onClick={() => {
              setDialogMessage(null)
              setFieldError(null)
              setRequestId(null)
              setSuccessMessage(null)
              setStatusOpen(true)
            }}
          >
            {t('updateStatus')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="btn--danger"
            onClick={() => {
              setDialogMessage(null)
              setFieldError(null)
              setRequestId(null)
              setSuccessMessage(null)
              setDeleteOpen(true)
            }}
          >
            {t('delete')}
          </Button>
        </div>
      </header>

      {successMessage ? (
        <div
          className="admin-contact-messages-success"
          role="status"
          aria-live="polite"
        >
          <p>{successMessage}</p>
        </div>
      ) : null}

      <ContactMessageDetailsSummary
        message={message}
        locale={i18n.language}
      />

      <ContactMessageStatusDialog
        open={statusOpen}
        message={message}
        pending={statusMutation.isPending}
        errorMessage={statusOpen ? dialogMessage : null}
        fieldError={statusOpen ? fieldError : null}
        requestId={statusOpen ? requestId : null}
        onClose={() => {
          if (!statusMutation.isPending) setStatusOpen(false)
        }}
        onSubmit={(status) => {
          void handleStatus(status)
        }}
      />

      <ContactMessageDeleteDialog
        open={deleteOpen}
        message={message}
        pending={deleteMutation.isPending}
        errorMessage={deleteOpen ? dialogMessage : null}
        requestId={deleteOpen ? requestId : null}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteOpen(false)
        }}
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </div>
  )
}
