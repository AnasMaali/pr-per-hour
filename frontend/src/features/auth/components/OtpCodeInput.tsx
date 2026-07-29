import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'
import { OTP_CODE_LENGTH } from '@/features/auth/utils/authValidation'

const OTP_LENGTH = OTP_CODE_LENGTH

export interface OtpCodeInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  label: string
  describedBy?: string
  autoFocus?: boolean
}

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, OTP_LENGTH)
}

/**
 * Six accessible digit inputs with paste, backspace, and mobile numeric keyboard support.
 */
export function OtpCodeInput({
  value,
  onChange,
  disabled = false,
  error,
  label,
  describedBy,
  autoFocus = false,
}: OtpCodeInputProps) {
  const baseId = useId()
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '')

  const focusIndex = useCallback((index: number) => {
    const el = inputsRef.current[index]
    el?.focus()
    el?.select()
  }, [])

  useEffect(() => {
    if (autoFocus && !disabled) {
      focusIndex(0)
    }
  }, [autoFocus, disabled, focusIndex])

  function setDigit(index: number, digit: string) {
    const next = digits.slice()
    next[index] = digit
    onChange(next.join('').replace(/\s/g, ''))
  }

  function handleChange(index: number, raw: string) {
    const cleaned = digitsOnly(raw)
    if (cleaned.length === 0) {
      setDigit(index, '')
      return
    }
    if (cleaned.length > 1) {
      // Paste into a single cell or autofill spanning multiple digits.
      const merged = digitsOnly(
        value.slice(0, index) + cleaned + value.slice(index + 1),
      )
      onChange(merged)
      focusIndex(Math.min(OTP_LENGTH - 1, index + cleaned.length - 1))
      return
    }
    setDigit(index, cleaned)
    if (index < OTP_LENGTH - 1) {
      focusIndex(index + 1)
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '')
        return
      }
      if (index > 0) {
        event.preventDefault()
        setDigit(index - 1, '')
        focusIndex(index - 1)
      }
      return
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusIndex(index - 1)
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusIndex(index + 1)
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = digitsOnly(event.clipboardData.getData('text'))
    if (!pasted) return
    onChange(pasted)
    focusIndex(Math.min(OTP_LENGTH - 1, pasted.length - 1))
  }

  const errorId = error ? `${baseId}-error` : undefined
  const descriptionIds = [describedBy, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="otp-field">
      <span className="field__label" id={`${baseId}-label`}>
        {label}
      </span>
      <div
        className="otp-field__inputs"
        role="group"
        aria-labelledby={`${baseId}-label`}
        aria-describedby={descriptionIds}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            id={`${baseId}-${index}`}
            className={`otp-field__digit${error ? ' otp-field__digit--error' : ''}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`${label} ${index + 1} of ${OTP_LENGTH}`}
            aria-invalid={error ? true : undefined}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
          />
        ))}
      </div>
      {error ? (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { OTP_CODE_LENGTH }
