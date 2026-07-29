import { useEffect, useId, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Textarea } from '@/shared/components/Textarea'
import { CategoryDialogShell } from '@/features/admin/categories/components/CategoryDialogShell'
import type {
  AdminCategory,
  CategoryFieldErrors,
  CategoryFormValues,
} from '@/features/admin/categories/types/adminCategories.types'
import {
  categoryToFormValues,
  emptyCategoryFormValues,
  formToCreatePayload,
  formToUpdatePayload,
  hasCategoryFieldErrors,
  suggestCategorySlug,
  validateCategoryForm,
} from '@/features/admin/categories/utils/categoryValidation'

interface CategoryFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  category?: AdminCategory | null
  pending: boolean
  apiFieldErrors: CategoryFieldErrors
  formMessage: string | null
  requestId: string | null
  onClose: () => void
  onCreate: (payload: ReturnType<typeof formToCreatePayload>) => void
  onUpdate: (args: {
    id: number
    content: ReturnType<typeof formToUpdatePayload>
    statusChanged: boolean
    is_active: boolean
  }) => void
}

export function CategoryFormDialog({
  open,
  mode,
  category,
  pending,
  apiFieldErrors,
  formMessage,
  requestId,
  onClose,
  onCreate,
  onUpdate,
}: CategoryFormDialogProps) {
  const { t } = useTranslation('adminCategories')
  const formId = useId()
  const [values, setValues] = useState<CategoryFormValues>(emptyCategoryFormValues)
  const [baseline, setBaseline] = useState<CategoryFormValues>(emptyCategoryFormValues)
  const [clientErrors, setClientErrors] = useState<CategoryFieldErrors>({})
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && category) {
      const next = categoryToFormValues(category)
      setValues(next)
      setBaseline(next)
    } else {
      const next = emptyCategoryFormValues()
      setValues(next)
      setBaseline(next)
    }
    setClientErrors({})
    setSlugTouched(false)
  }, [open, mode, category])

  const isDirty =
    values.name !== baseline.name ||
    values.slug !== baseline.slug ||
    values.description !== baseline.description ||
    values.is_active !== baseline.is_active

  function resolveError(value: string | undefined): string | undefined {
    if (!value) return undefined
    if (value.startsWith('validation') || value.startsWith('error')) {
      return t(value)
    }
    return value
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const errors = validateCategoryForm(values, mode)
    setClientErrors(errors)
    if (hasCategoryFieldErrors(errors) || pending) return

    if (mode === 'create') {
      onCreate(formToCreatePayload(values))
      return
    }

    if (!category || !isDirty) return
    onUpdate({
      id: category.id,
      content: formToUpdatePayload(values, baseline),
      statusChanged: values.is_active !== baseline.is_active,
      is_active: values.is_active,
    })
  }

  const nameError = resolveError(clientErrors.name ?? apiFieldErrors.name)
  const slugError = resolveError(clientErrors.slug ?? apiFieldErrors.slug)
  const descriptionError = resolveError(
    clientErrors.description ?? apiFieldErrors.description,
  )

  return (
    <CategoryDialogShell
      open={open}
      pending={pending}
      title={mode === 'create' ? t('createTitle') : t('editTitle')}
      description={
        mode === 'create' ? t('createDescription') : t('editDescription')
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
            form={formId}
            disabled={pending || (mode === 'edit' && !isDirty)}
          >
            {pending
              ? mode === 'create'
                ? t('creating')
                : t('saving')
              : mode === 'create'
                ? t('create')
                : t('save')}
          </Button>
        </>
      }
    >
      <form id={formId} className="category-form" onSubmit={handleSubmit} noValidate>
        {formMessage ? (
          <div className="category-form-error" role="alert">
            <p>{formMessage}</p>
            {requestId ? (
              <p className="category-form-error__meta">
                {t('requestId')}: <code>{requestId}</code>
              </p>
            ) : null}
          </div>
        ) : null}

        <Input
          id={`${formId}-name`}
          name="name"
          label={t('name')}
          value={values.name}
          disabled={pending}
          error={nameError}
          required
          onChange={(event) => {
            const name = event.target.value
            setValues((current) => ({
              ...current,
              name,
              slug:
                mode === 'create' && !slugTouched
                  ? suggestCategorySlug(name)
                  : current.slug,
            }))
          }}
        />

        <div className="category-form__slug-row">
          <Input
            id={`${formId}-slug`}
            name="slug"
            label={t('slug')}
            value={values.slug}
            disabled={pending}
            error={slugError}
            hint={t('slugHint')}
            required
            onChange={(event) => {
              setSlugTouched(true)
              setValues((current) => ({
                ...current,
                slug: event.target.value,
              }))
            }}
          />
          <Button
            type="button"
            variant="ghost"
            disabled={pending || !values.name.trim()}
            onClick={() => {
              setSlugTouched(true)
              setValues((current) => ({
                ...current,
                slug: suggestCategorySlug(current.name),
              }))
            }}
          >
            {t('suggestSlug')}
          </Button>
        </div>

        <Textarea
          id={`${formId}-description`}
          name="description"
          label={t('description')}
          value={values.description}
          disabled={pending}
          error={descriptionError}
          hint={t('descriptionHint')}
          rows={4}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />

        <div className="category-form__active">
          <label className="category-form__checkbox">
            <input
              type="checkbox"
              checked={values.is_active}
              disabled={pending}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
            />
            <span>{t('isActive')}</span>
          </label>
          <p className="field__hint">
            {mode === 'edit' ? t('isActiveEditHint') : t('isActiveCreateHint')}
          </p>
        </div>
      </form>
    </CategoryDialogShell>
  )
}
