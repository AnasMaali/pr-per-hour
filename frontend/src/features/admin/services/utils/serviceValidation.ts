import type {
  CreateServicePayload,
  ServiceFieldErrors,
  ServiceFormValues,
  UpdateServicePayload,
} from '@/features/admin/services/types/adminServices.types'

export const SERVICE_TITLE_MAX = 255
export const SERVICE_SLUG_MAX = 255
export const SERVICE_CURRENCY_MAX = 10
export const SERVICE_PRICE_MAX_WHOLE = '99999999'
export const SERVICE_PRICE_MAX_FRAC = '99'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const CURRENCY_PATTERN = /^[A-Z0-9]+$/
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/
const DURATION_PATTERN = /^\d+$/

/** Client-side slug helper aligned with Laravel Str::slug expectations. */
export function suggestServiceSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidServiceSlug(value: string): boolean {
  return SLUG_PATTERN.test(value)
}

/**
 * Validate decimal price as a string without floating-point conversion.
 * Allows up to DECIMAL(10,2): 99999999.99
 */
export function isValidPriceString(value: string): boolean {
  const trimmed = value.trim()
  if (!PRICE_PATTERN.test(trimmed)) return false

  const parts = trimmed.split('.')
  const wholeRaw = parts[0] ?? '0'
  const frac = parts[1] ?? ''
  const normalizedWhole = wholeRaw.replace(/^0+(?=\d)/, '') || '0'
  if (normalizedWhole.length > SERVICE_PRICE_MAX_WHOLE.length) return false
  if (normalizedWhole.length < SERVICE_PRICE_MAX_WHOLE.length) return true
  if (normalizedWhole > SERVICE_PRICE_MAX_WHOLE) return false
  if (normalizedWhole < SERVICE_PRICE_MAX_WHOLE) return true

  const normalizedFrac = frac.padEnd(2, '0').slice(0, 2)
  return normalizedFrac <= SERVICE_PRICE_MAX_FRAC
}

export function normalizeCurrency(value: string): string {
  return value.trim().toUpperCase()
}

export function validateServiceForm(
  values: ServiceFormValues,
  mode: 'create' | 'edit',
): ServiceFieldErrors {
  const errors: ServiceFieldErrors = {}
  const title = values.title.trim()
  const slug = values.slug.trim()
  const currency = normalizeCurrency(values.currency)
  const price = values.price.trim()
  const duration = values.duration_minutes.trim()
  const categoryId = values.category_id.trim()

  if (!categoryId) {
    errors.category_id = 'validationCategoryRequired'
  } else if (!/^\d+$/.test(categoryId) || Number.parseInt(categoryId, 10) < 1) {
    errors.category_id = 'validationCategoryInvalid'
  }

  if (!title) {
    errors.title = 'validationTitleRequired'
  } else if (title.length > SERVICE_TITLE_MAX) {
    errors.title = 'validationTitleMax'
  }

  if (!slug) {
    errors.slug = 'validationSlugRequired'
  } else if (slug.length > SERVICE_SLUG_MAX) {
    errors.slug = 'validationSlugMax'
  } else if (!isValidServiceSlug(slug)) {
    errors.slug = 'validationSlugFormat'
  }

  if (duration !== '') {
    if (!DURATION_PATTERN.test(duration)) {
      errors.duration_minutes = 'validationDurationInteger'
    }
  }

  if (mode === 'create') {
    if (price !== '' && !isValidPriceString(price)) {
      errors.price = 'validationPriceFormat'
    }
  } else if (price === '') {
    errors.price = 'validationPriceRequired'
  } else if (!isValidPriceString(price)) {
    errors.price = 'validationPriceFormat'
  }

  if (currency === '') {
    if (mode === 'edit') {
      errors.currency = 'validationCurrencyRequired'
    }
  } else if (currency.length > SERVICE_CURRENCY_MAX) {
    errors.currency = 'validationCurrencyMax'
  } else if (!CURRENCY_PATTERN.test(currency)) {
    errors.currency = 'validationCurrencyFormat'
  }

  return errors
}

export function hasServiceFieldErrors(errors: ServiceFieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function formToCreatePayload(
  values: ServiceFormValues,
): CreateServicePayload {
  const description = values.description.trim()
  const duration = values.duration_minutes.trim()
  const price = values.price.trim()
  const currency = normalizeCurrency(values.currency)

  const payload: CreateServicePayload = {
    category_id: Number.parseInt(values.category_id, 10),
    title: values.title.trim(),
    slug: values.slug.trim(),
    description: description === '' ? null : description,
    duration_minutes: duration === '' ? null : Number.parseInt(duration, 10),
    is_active: values.is_active,
  }

  if (price !== '') payload.price = price
  if (currency !== '') payload.currency = currency

  return payload
}

export function formToUpdatePayload(
  values: ServiceFormValues,
  baseline: ServiceFormValues,
): UpdateServicePayload | null {
  const payload: UpdateServicePayload = {}
  const title = values.title.trim()
  const slug = values.slug.trim()
  const description = values.description.trim()
  const baselineDescription = baseline.description.trim()
  const duration = values.duration_minutes.trim()
  const baselineDuration = baseline.duration_minutes.trim()
  const price = values.price.trim()
  const currency = normalizeCurrency(values.currency)
  const baselineCurrency = normalizeCurrency(baseline.currency)

  if (values.category_id !== baseline.category_id) {
    payload.category_id = Number.parseInt(values.category_id, 10)
  }
  if (title !== baseline.title.trim()) payload.title = title
  if (slug !== baseline.slug.trim()) payload.slug = slug
  if (description !== baselineDescription) {
    payload.description = description === '' ? null : description
  }
  if (duration !== baselineDuration) {
    payload.duration_minutes =
      duration === '' ? null : Number.parseInt(duration, 10)
  }
  if (price !== baseline.price.trim()) payload.price = price
  if (currency !== baselineCurrency) payload.currency = currency

  return Object.keys(payload).length > 0 ? payload : null
}

export function serviceToFormValues(service: {
  title: string
  slug: string
  description: string | null
  duration_minutes: number | null
  price: string
  currency: string
  is_active: boolean
  category: { id: number } | null
}): ServiceFormValues {
  return {
    category_id: service.category ? String(service.category.id) : '',
    title: service.title,
    slug: service.slug,
    description: service.description ?? '',
    duration_minutes:
      service.duration_minutes === null || service.duration_minutes === undefined
        ? ''
        : String(service.duration_minutes),
    price: service.price,
    currency: service.currency,
    is_active: service.is_active,
  }
}

export function emptyServiceFormValues(): ServiceFormValues {
  return {
    category_id: '',
    title: '',
    slug: '',
    description: '',
    duration_minutes: '',
    price: '0.00',
    currency: 'USD',
    is_active: true,
  }
}
