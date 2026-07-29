import type {
  ContactFieldErrors,
  ContactFormValues,
  SubmitContactMessagePayload,
} from '@/features/contact/types/contact.types'
import {
  EMAIL_MAX,
  FULL_NAME_MAX,
  MESSAGE_MAX,
  ORGANIZATION_MAX,
  PHONE_MAX,
} from '@/features/contact/types/contact.types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContactForm(values: ContactFormValues): ContactFieldErrors {
  const errors: ContactFieldErrors = {}
  const fullName = values.full_name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()
  const organization = values.organization.trim()
  const message = values.message.trim()

  if (!fullName) {
    errors.full_name = 'validationFullNameRequired'
  } else if (fullName.length > FULL_NAME_MAX) {
    errors.full_name = 'validationFullNameMax'
  }

  if (!email) {
    errors.email = 'validationEmailRequired'
  } else if (email.length > EMAIL_MAX) {
    errors.email = 'validationEmailMax'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'validationEmailInvalid'
  }

  if (phone.length > PHONE_MAX) {
    errors.phone = 'validationPhoneMax'
  }

  if (organization.length > ORGANIZATION_MAX) {
    errors.organization = 'validationOrganizationMax'
  }

  if (!message) {
    errors.message = 'validationMessageRequired'
  } else if (message.length > MESSAGE_MAX) {
    errors.message = 'validationMessageMax'
  }

  return errors
}

export function hasContactFieldErrors(errors: ContactFieldErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Normalize for POST. Empty optional fields become null (Laravel nullable).
 * Email is trimmed + lowercased to match backend prepareForValidation.
 * Message is trimmed at ends only; internal line breaks preserved.
 */
export function normalizeContactPayload(
  values: ContactFormValues,
): SubmitContactMessagePayload {
  const phone = values.phone.trim()
  const organization = values.organization.trim()

  return {
    full_name: values.full_name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: phone === '' ? null : phone,
    organization: organization === '' ? null : organization,
    message: values.message.trim(),
    website: values.website,
  }
}
