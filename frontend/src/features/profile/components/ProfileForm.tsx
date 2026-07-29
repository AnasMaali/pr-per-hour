import { useEffect, useId, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import type { AuthUser } from '@/shared/types/user'
import { ProfileUpdateStatus } from '@/features/profile/components/ProfileUpdateStatus'
import type {
  ProfileFieldErrors,
  ProfileFormValues,
  ProfileUpdatePayload,
} from '@/features/profile/types/profile.types'
import {
  hasProfileFieldErrors,
  profileFormToPayload,
  profileValuesEqual,
  userToProfileFormValues,
  validateProfileForm,
} from '@/features/profile/utils/profileValidation'

interface ProfileFormProps {
  user: AuthUser
  pending: boolean
  apiFieldErrors: ProfileFieldErrors
  formMessage: string | null
  requestId: string | null
  successMessage: string | null
  onSubmit: (payload: ProfileUpdatePayload) => void
  onEditAfterSuccess?: () => void
}

export function ProfileForm({
  user,
  pending,
  apiFieldErrors,
  formMessage,
  requestId,
  successMessage,
  onSubmit,
  onEditAfterSuccess,
}: ProfileFormProps) {
  const { t } = useTranslation('profile')
  const formId = useId()
  const [values, setValues] = useState<ProfileFormValues>(() =>
    userToProfileFormValues(user),
  )
  const [baseline, setBaseline] = useState<ProfileFormValues>(() =>
    userToProfileFormValues(user),
  )
  const [clientErrors, setClientErrors] = useState<ProfileFieldErrors>({})

  const isDirty = !profileValuesEqual(values, baseline)

  useEffect(() => {
    if (isDirty) return
    const next = userToProfileFormValues(user)
    setValues(next)
    setBaseline(next)
  }, [user, isDirty])

  useEffect(() => {
    if (!successMessage) return
    const next = userToProfileFormValues(user)
    setValues(next)
    setBaseline(next)
    setClientErrors({})
  }, [successMessage, user])

  function resolveError(value: string | undefined): string | undefined {
    if (!value) return undefined
    if (value.startsWith('validation') || value.startsWith('error')) {
      return t(value)
    }
    return value
  }

  function update<K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    onEditAfterSuccess?.()
  }

  function handleReset() {
    setValues(baseline)
    setClientErrors({})
    onEditAfterSuccess?.()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const errors = validateProfileForm(values)
    setClientErrors(errors)
    if (hasProfileFieldErrors(errors) || !isDirty || pending) return
    onSubmit(profileFormToPayload(values))
  }

  const nameError = resolveError(clientErrors.name ?? apiFieldErrors.name)
  const phoneError = resolveError(clientErrors.phone ?? apiFieldErrors.phone)

  return (
    <form
      className="profile-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${formId}-title`}
    >
      <div className="profile-form__header">
        <h2 id={`${formId}-title`}>{t('updateDetails')}</h2>
        <p>{t('updateDetailsLead')}</p>
      </div>

      <ProfileUpdateStatus
        successMessage={successMessage}
        errorMessage={formMessage}
        requestId={requestId}
        requestIdLabel={t('requestId')}
      />

      {isDirty ? (
        <p className="profile-form__dirty" role="status">
          {t('unsavedChanges')}
        </p>
      ) : (
        <p className="profile-form__clean" role="status">
          {t('noChanges')}
        </p>
      )}

      <Input
        id={`${formId}-name`}
        name="name"
        label={t('name')}
        autoComplete="name"
        value={values.name}
        disabled={pending}
        error={nameError}
        onChange={(event) => update('name', event.target.value)}
        required
      />

      <Input
        id={`${formId}-email`}
        name="email"
        type="email"
        label={t('email')}
        value={user.email}
        readOnly
        aria-readonly="true"
        tabIndex={0}
        className="profile-form__readonly"
        hint={t('emailReadOnlyHint')}
        autoComplete="email"
      />

      <Input
        id={`${formId}-phone`}
        name="phone"
        type="tel"
        label={t('phone')}
        autoComplete="tel"
        value={values.phone}
        disabled={pending}
        error={phoneError}
        hint={phoneError ? undefined : t('phoneOptionalHint')}
        onChange={(event) => update('phone', event.target.value)}
      />

      <div className="profile-form__actions">
        <Button type="submit" disabled={pending || !isDirty}>
          {pending ? t('saving') : t('saveChanges')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending || !isDirty}
          onClick={handleReset}
        >
          {t('reset')}
        </Button>
      </div>
    </form>
  )
}
