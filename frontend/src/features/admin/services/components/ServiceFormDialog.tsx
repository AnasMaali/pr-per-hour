import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'
import type { AdminCategory } from '@/features/admin/categories/types/adminCategories.types'
import { ServiceDialogShell } from '@/features/admin/services/components/ServiceDialogShell'
import type {
  AdminService,
  ServiceFieldErrors,
  ServiceFormValues,
} from '@/features/admin/services/types/adminServices.types'
import {
  emptyServiceFormValues,
  formToCreatePayload,
  formToUpdatePayload,
  hasServiceFieldErrors,
  serviceToFormValues,
  suggestServiceSlug,
  validateServiceForm,
} from '@/features/admin/services/utils/serviceValidation'

interface ServiceFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  service?: AdminService | null
  categories: AdminCategory[]
  categoriesLoading: boolean
  categoriesError: boolean
  pending: boolean
  apiFieldErrors: ServiceFieldErrors
  formMessage: string | null
  requestId: string | null
  onClose: () => void
  onRetryCategories: () => void
  onCreate: (payload: ReturnType<typeof formToCreatePayload>) => void
  onUpdate: (args: {
    id: number
    content: ReturnType<typeof formToUpdatePayload>
    statusChanged: boolean
    is_active: boolean
  }) => void
}

export function ServiceFormDialog({
  open,
  mode,
  service,
  categories,
  categoriesLoading,
  categoriesError,
  pending,
  apiFieldErrors,
  formMessage,
  requestId,
  onClose,
  onRetryCategories,
  onCreate,
  onUpdate,
}: ServiceFormDialogProps) {
  const { t } = useTranslation('adminServices')
  const formId = useId()
  const [values, setValues] = useState<ServiceFormValues>(emptyServiceFormValues)
  const [baseline, setBaseline] = useState<ServiceFormValues>(
    emptyServiceFormValues,
  )
  const [clientErrors, setClientErrors] = useState<ServiceFieldErrors>({})
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && service) {
      const next = serviceToFormValues(service)
      setValues(next)
      setBaseline(next)
    } else {
      const next = emptyServiceFormValues()
      setValues(next)
      setBaseline(next)
    }
    setClientErrors({})
    setSlugTouched(false)
  }, [open, mode, service])

  const categoryOptions = useMemo(() => {
    const options = categories.map((category) => ({
      value: String(category.id),
      label: category.is_active
        ? category.name
        : `${category.name} (${t('inactive')})`,
    }))

    // Keep currently assigned inactive/missing category representable.
    if (
      mode === 'edit' &&
      service?.category &&
      !options.some((option) => option.value === String(service.category?.id))
    ) {
      options.unshift({
        value: String(service.category.id),
        label: `${service.category.name} (${t('inactive')})`,
      })
    }

    return [{ value: '', label: t('selectCategory') }, ...options]
  }, [categories, mode, service, t])

  const isDirty =
    values.category_id !== baseline.category_id ||
    values.title !== baseline.title ||
    values.slug !== baseline.slug ||
    values.description !== baseline.description ||
    values.duration_minutes !== baseline.duration_minutes ||
    values.price !== baseline.price ||
    values.currency !== baseline.currency ||
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
    if (categoriesError || categoriesLoading) return

    const errors = validateServiceForm(values, mode)
    setClientErrors(errors)
    if (hasServiceFieldErrors(errors) || pending) return

    if (mode === 'create') {
      onCreate(formToCreatePayload(values))
      return
    }

    if (!service || !isDirty) return
    onUpdate({
      id: service.id,
      content: formToUpdatePayload(values, baseline),
      statusChanged: values.is_active !== baseline.is_active,
      is_active: values.is_active,
    })
  }

  const categoryError = resolveError(
    clientErrors.category_id ?? apiFieldErrors.category_id,
  )
  const titleError = resolveError(clientErrors.title ?? apiFieldErrors.title)
  const slugError = resolveError(clientErrors.slug ?? apiFieldErrors.slug)
  const descriptionError = resolveError(
    clientErrors.description ?? apiFieldErrors.description,
  )
  const durationError = resolveError(
    clientErrors.duration_minutes ?? apiFieldErrors.duration_minutes,
  )
  const priceError = resolveError(clientErrors.price ?? apiFieldErrors.price)
  const currencyError = resolveError(
    clientErrors.currency ?? apiFieldErrors.currency,
  )

  const categoryBlocked = categoriesError || categoriesLoading

  return (
    <ServiceDialogShell
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
            disabled={
              pending ||
              categoryBlocked ||
              (mode === 'edit' && !isDirty)
            }
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
      <form
        id={formId}
        className="service-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {formMessage ? (
          <div className="service-form-error" role="alert">
            <p>{formMessage}</p>
            {requestId ? (
              <p className="service-form-error__meta">
                {t('requestId')}: <code>{requestId}</code>
              </p>
            ) : null}
          </div>
        ) : null}

        {categoriesError ? (
          <div className="service-form-error" role="alert">
            <p>{t('categoriesFormError')}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={onRetryCategories}
            >
              {t('retry')}
            </Button>
          </div>
        ) : null}

        <Select
          id={`${formId}-category`}
          name="category_id"
          label={t('category')}
          value={values.category_id}
          disabled={pending || categoryBlocked}
          error={categoryError}
          options={categoryOptions}
          required
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              category_id: event.target.value,
            }))
          }
        />

        <Input
          id={`${formId}-title`}
          name="title"
          label={t('title')}
          value={values.title}
          disabled={pending}
          error={titleError}
          required
          onChange={(event) => {
            const title = event.target.value
            setValues((current) => ({
              ...current,
              title,
              slug:
                mode === 'create' && !slugTouched
                  ? suggestServiceSlug(title)
                  : current.slug,
            }))
          }}
        />

        <div className="service-form__slug-row">
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
            disabled={pending || !values.title.trim()}
            onClick={() => {
              setSlugTouched(true)
              setValues((current) => ({
                ...current,
                slug: suggestServiceSlug(current.title),
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

        <div className="service-form__grid">
          <Input
            id={`${formId}-duration`}
            name="duration_minutes"
            label={t('duration')}
            inputMode="numeric"
            value={values.duration_minutes}
            disabled={pending}
            error={durationError}
            hint={t('durationHint')}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                duration_minutes: event.target.value,
              }))
            }
          />
          <Input
            id={`${formId}-price`}
            name="price"
            label={t('price')}
            inputMode="decimal"
            value={values.price}
            disabled={pending}
            error={priceError}
            hint={t('priceHint')}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                price: event.target.value,
              }))
            }
          />
          <Input
            id={`${formId}-currency`}
            name="currency"
            label={t('currency')}
            value={values.currency}
            disabled={pending}
            error={currencyError}
            hint={t('currencyHint')}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                currency: event.target.value.toUpperCase(),
              }))
            }
          />
        </div>

        <div className="service-form__active">
          <label className="service-form__checkbox">
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
    </ServiceDialogShell>
  )
}
