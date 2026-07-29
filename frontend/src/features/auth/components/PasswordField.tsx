import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
  error?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    { id, label, hint, error, className, ...props },
    ref,
  ) {
    const { t } = useTranslation('auth')
    const [visible, setVisible] = useState(false)
    const inputId = id ?? props.name
    const hintId = hint ? `${inputId}-hint` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const toggleLabel = visible ? t('hidePassword') : t('showPassword')

    return (
      <div className="field">
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
        <div className="password-field">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            className={cn('field__control password-field__input', className)}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={
              [hintId, errorId].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />
          <button
            type="button"
            className="password-field__toggle"
            onClick={() => setVisible((current) => !current)}
            aria-label={toggleLabel}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        </div>
        {hint && !error ? (
          <span id={hintId} className="field__hint">
            {hint}
          </span>
        ) : null}
        {error ? (
          <span id={errorId} className="field__error" role="alert">
            {error}
          </span>
        ) : null}
      </div>
    )
  },
)
