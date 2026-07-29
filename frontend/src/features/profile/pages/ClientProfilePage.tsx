import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/shared/components/EmptyState'
import { InlineLoader } from '@/shared/components/InlineLoader'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { useAuth } from '@/features/auth/AuthProvider'
import { ProfileForm } from '@/features/profile/components/ProfileForm'
import { ProfileSummary } from '@/features/profile/components/ProfileSummary'
import { useUpdateProfileMutation } from '@/features/profile/hooks/useUpdateProfileMutation'
import type {
  ProfileFieldErrors,
  ProfileUpdatePayload,
} from '@/features/profile/types/profile.types'
import { mapProfileApiError } from '@/features/profile/utils/mapProfileApiError'
import '@/features/profile/styles/client-profile.css'

export function ClientProfilePage() {
  const { t } = useTranslation('profile')
  const { user, isBootstrapping } = useAuth()
  const updateMutation = useUpdateProfileMutation()
  const [apiFieldErrors, setApiFieldErrors] = useState<ProfileFieldErrors>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useDocumentMeta({
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  async function handleSubmit(payload: ProfileUpdatePayload) {
    setApiFieldErrors({})
    setFormMessage(null)
    setRequestId(null)
    setSuccessMessage(null)

    try {
      await updateMutation.mutateAsync(payload)
      setSuccessMessage(t('changesSaved'))
    } catch (error) {
      const mapped = mapProfileApiError(error)
      setApiFieldErrors(mapped.fieldErrors)
      setRequestId(mapped.requestId)
      setFormMessage(
        mapped.formMessageKey
          ? t(mapped.formMessageKey)
          : mapped.formMessage,
      )
    }
  }

  if (isBootstrapping) {
    return (
      <div className="client-profile-page">
        <InlineLoader label={t('loadingProfile')} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="client-profile-page">
        <EmptyState
          title={t('unavailableTitle')}
          description={t('unavailableDescription')}
        />
      </div>
    )
  }

  return (
    <div className="client-profile-page">
      <header className="client-profile-header">
        <div>
          <h1>{t('title')}</h1>
          <p>{t('lead')}</p>
        </div>
      </header>

      <div className="client-profile-layout">
        <ProfileSummary user={user} />
        <ProfileForm
          user={user}
          pending={updateMutation.isPending}
          apiFieldErrors={apiFieldErrors}
          formMessage={formMessage}
          requestId={requestId}
          successMessage={successMessage}
          onSubmit={(payload) => {
            void handleSubmit(payload)
          }}
          onEditAfterSuccess={() => {
            if (successMessage) setSuccessMessage(null)
            if (formMessage) setFormMessage(null)
            if (Object.keys(apiFieldErrors).length > 0) setApiFieldErrors({})
          }}
        />
      </div>
    </div>
  )
}
