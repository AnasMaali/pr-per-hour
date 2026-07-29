import type {
  CategoryFieldErrors,
  CategoryFormValues,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/features/admin/categories/types/adminCategories.types'

export const CATEGORY_NAME_MAX = 255
export const CATEGORY_SLUG_MAX = 255

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Client-side slug helper aligned with Laravel Str::slug expectations. */
export function suggestCategorySlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidCategorySlug(value: string): boolean {
  return SLUG_PATTERN.test(value)
}

export function validateCategoryForm(
  values: CategoryFormValues,
  mode: 'create' | 'edit',
): CategoryFieldErrors {
  const errors: CategoryFieldErrors = {}
  const name = values.name.trim()
  const slug = values.slug.trim()

  if (!name) {
    errors.name = 'validationNameRequired'
  } else if (name.length > CATEGORY_NAME_MAX) {
    errors.name = 'validationNameMax'
  }

  if (!slug) {
    errors.slug = 'validationSlugRequired'
  } else if (slug.length > CATEGORY_SLUG_MAX) {
    errors.slug = 'validationSlugMax'
  } else if (!isValidCategorySlug(slug)) {
    errors.slug = 'validationSlugFormat'
  }

  // Backend description is nullable string with no max rule — do not invent one.
  void mode

  return errors
}

export function hasCategoryFieldErrors(errors: CategoryFieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function formToCreatePayload(
  values: CategoryFormValues,
): CreateCategoryPayload {
  const description = values.description.trim()
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: description === '' ? null : description,
    is_active: values.is_active,
  }
}

export function formToUpdatePayload(
  values: CategoryFormValues,
  baseline: CategoryFormValues,
): UpdateCategoryPayload | null {
  const payload: UpdateCategoryPayload = {}
  const name = values.name.trim()
  const slug = values.slug.trim()
  const description = values.description.trim()
  const baselineDescription = baseline.description.trim()

  if (name !== baseline.name.trim()) payload.name = name
  if (slug !== baseline.slug.trim()) payload.slug = slug
  if (description !== baselineDescription) {
    payload.description = description === '' ? null : description
  }

  return Object.keys(payload).length > 0 ? payload : null
}

export function categoryToFormValues(category: {
  name: string
  slug: string
  description: string | null
  is_active: boolean
}): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    is_active: category.is_active,
  }
}

export function emptyCategoryFormValues(): CategoryFormValues {
  return {
    name: '',
    slug: '',
    description: '',
    is_active: true,
  }
}
