import type {
  ProfileFieldErrors,
  ProfileFormValues,
  ProfileUpdatePayload,
} from '@/features/profile/types/profile.types'

export const PROFILE_NAME_MAX = 255
export const PROFILE_PHONE_MAX = 50

export function normalizePhoneInput(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function validateProfileForm(
  values: ProfileFormValues,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {}
  const name = values.name.trim()
  const phone = values.phone.trim()

  if (!name) {
    errors.name = 'validationNameRequired'
  } else if (name.length > PROFILE_NAME_MAX) {
    errors.name = 'validationNameMax'
  }

  if (phone.length > PROFILE_PHONE_MAX) {
    errors.phone = 'validationPhoneMax'
  }

  return errors
}

export function hasProfileFieldErrors(errors: ProfileFieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function profileFormToPayload(
  values: ProfileFormValues,
): ProfileUpdatePayload {
  return {
    name: values.name.trim(),
    phone: normalizePhoneInput(values.phone),
  }
}

export function profileValuesEqual(
  a: ProfileFormValues,
  b: ProfileFormValues,
): boolean {
  return (
    a.name.trim() === b.name.trim() &&
    normalizePhoneInput(a.phone) === normalizePhoneInput(b.phone)
  )
}

export function userToProfileFormValues(user: {
  name: string
  phone: string | null
}): ProfileFormValues {
  return {
    name: user.name,
    phone: user.phone ?? '',
  }
}
