import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ id, label, hint, error, className, ...props }, ref) {
    const inputId = id ?? props.name
    const hintId = hint ? `${inputId}-hint` : undefined
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="field">
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={cn('field__control', className)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(' ') || undefined
          }
          {...props}
        />
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
