import {
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Textarea } from '@/shared/components/Textarea'
import { useSubmitContactMessageMutation } from '@/features/contact/mutations/useSubmitContactMessageMutation'
import type {
  ContactFieldErrors,
  ContactFormValues,
  ContactMessageReceipt,
} from '@/features/contact/types/contact.types'
import { MESSAGE_MAX } from '@/features/contact/types/contact.types'
import { mapContactApiError } from '@/features/contact/utils/contactErrorMapping'
import {
  hasContactFieldErrors,
  normalizeContactPayload,
  validateContactForm,
} from '@/features/contact/utils/contactValidation'

const INITIAL: ContactFormValues = {
  full_name: '',
  email: '',
  phone: '',
  organization: '',
  message: '',
  website: '',
}

interface ContactFormProps {
  onSuccess: (receipt: ContactMessageReceipt) => void
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const { t } = useTranslation('contact')
  const formId = useId()
  const summaryId = `${formId}-summary`
  const fullNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const organizationRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  const [values, setValues] = useState<ContactFormValues>(INITIAL)
  const [clientErrors, setClientErrors] = useState<ContactFieldErrors>({})
  const [serverFieldErrors, setServerFieldErrors] = useState<ContactFieldErrors>(
    {},
  )
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  const mutation = useSubmitContactMessageMutation()
  const pending = mutation.isPending

  const fieldErrors: ContactFieldErrors = {
    ...clientErrors,
    ...serverFieldErrors,
  }

  function update<K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function resolveError(key: string | undefined): string | undefined {
    if (!key) return undefined
    if (key.startsWith('validation') || key.startsWith('error')) return t(key)
    return key
  }

  function focusFromErrors(
    errors: ContactFieldErrors,
    hasFormError: boolean,
  ) {
    if (errors.full_name) {
      fullNameRef.current?.focus()
      return
    }
    if (errors.email) {
      emailRef.current?.focus()
      return
    }
    if (errors.phone) {
      phoneRef.current?.focus()
      return
    }
    if (errors.organization) {
      organizationRef.current?.focus()
      return
    }
    if (errors.message) {
      messageRef.current?.focus()
      return
    }
    if (hasFormError) {
      summaryRef.current?.focus()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setFormMessage(null)
    setRequestId(null)
    setServerFieldErrors({})

    const errors = validateContactForm(values)
    if (hasContactFieldErrors(errors)) {
      setClientErrors(errors)
      focusFromErrors(errors, false)
      return
    }

    setClientErrors({})

    try {
      const receipt = await mutation.mutateAsync(
        normalizeContactPayload(values),
      )
      setValues(INITIAL)
      onSuccess(receipt)
    } catch (error) {
      const mapped = mapContactApiError(error)
      setServerFieldErrors(mapped.fieldErrors)
      setRequestId(mapped.requestId)
      setFormMessage(
        mapped.formMessageKey
          ? t(mapped.formMessageKey)
          : mapped.formMessage,
      )
      focusFromErrors(mapped.fieldErrors, Boolean(mapped.formMessageKey || mapped.formMessage))
    }
  }

  const errorEntries = (
    Object.entries(fieldErrors) as Array<[keyof ContactFieldErrors, string]>
  ).filter(([key, value]) => key !== 'form' && Boolean(value))

  return (
    <form
      className="contact-form"
      onSubmit={(event) => {
        void handleSubmit(event)
      }}
      noValidate
      aria-labelledby="contact-form-heading"
      aria-describedby={
        formMessage || errorEntries.length > 0 ? summaryId : undefined
      }
    >
      <div className="contact-form__header">
        <h2 id="contact-form-heading">{t('formHeading')}</h2>
        <p>{t('privacyNote')}</p>
      </div>

      {formMessage || errorEntries.length > 0 ? (
        <div
          ref={summaryRef}
          id={summaryId}
          className="contact-form__summary"
          role="alert"
          tabIndex={-1}
        >
          <p className="contact-form__summary-title">
            {formMessage ?? t('errorSummaryTitle')}
          </p>
          {errorEntries.length > 0 ? (
            <ul>
              {errorEntries.map(([key, value]) => (
                <li key={key}>{resolveError(value)}</li>
              ))}
            </ul>
          ) : null}
          {requestId ? (
            <p className="contact-form__meta">
              {t('requestId')}: <code>{requestId}</code>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          disabled={pending}
          onChange={(event) => update('website', event.target.value)}
        />
      </div>

      <div className="contact-form__grid">
        <Input
          ref={fullNameRef}
          id="contact-full-name"
          name="full_name"
          label={`${t('fullName')} (${t('required')})`}
          autoComplete="name"
          value={values.full_name}
          disabled={pending}
          error={resolveError(fieldErrors.full_name)}
          onChange={(event) => update('full_name', event.target.value)}
        />

        <Input
          ref={emailRef}
          id="contact-email"
          name="email"
          type="email"
          label={`${t('email')} (${t('required')})`}
          autoComplete="email"
          inputMode="email"
          value={values.email}
          disabled={pending}
          error={resolveError(fieldErrors.email)}
          onChange={(event) => update('email', event.target.value)}
        />

        <Input
          ref={phoneRef}
          id="contact-phone"
          name="phone"
          type="tel"
          label={`${t('phone')} (${t('phoneOptional')})`}
          autoComplete="tel"
          inputMode="tel"
          value={values.phone}
          disabled={pending}
          error={resolveError(fieldErrors.phone)}
          onChange={(event) => update('phone', event.target.value)}
        />

        <Input
          ref={organizationRef}
          id="contact-organization"
          name="organization"
          label={`${t('organization')} (${t('organizationOptional')})`}
          autoComplete="organization"
          value={values.organization}
          disabled={pending}
          error={resolveError(fieldErrors.organization)}
          onChange={(event) => update('organization', event.target.value)}
        />
      </div>

      <div className="contact-form__message">
        <Textarea
          ref={messageRef}
          id="contact-message"
          name="message"
          label={`${t('message')} (${t('required')})`}
          rows={6}
          value={values.message}
          disabled={pending}
          hint={t('messageHint', { max: MESSAGE_MAX })}
          error={resolveError(fieldErrors.message)}
          onChange={(event) => update('message', event.target.value)}
        />
        <p className="contact-form__count" aria-live="polite">
          {t('messageCount', {
            count: values.message.length,
            max: MESSAGE_MAX,
          })}
        </p>
      </div>

      <div className="contact-form__actions">
        <Button type="submit" disabled={pending}>
          {pending ? t('sending') : t('sendMessage')}
        </Button>
      </div>
    </form>
  )
}
