import { useTranslation } from 'react-i18next'
import { changeAppLocale } from '@/shared/i18n'
import type { AppLocale } from '@/shared/i18n/locale'
import { useReducedMotion } from '@/shared/motion'
import { cn } from '@/shared/utils/cn'

const OPTIONS: Array<{ value: AppLocale; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'ar', label: 'AR' },
]

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation('common')
  const reducedMotion = useReducedMotion()
  const current: AppLocale = i18n.language?.startsWith('ar') ? 'ar' : 'en'

  return (
    <div
      className={cn(
        'lang-switch',
        reducedMotion && 'lang-switch--reduced',
        className,
      )}
      data-active={current}
      role="group"
      aria-label={t('language')}
    >
      <span className="lang-switch__rail" aria-hidden="true" />
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="lang-switch__button"
          aria-pressed={current === option.value}
          onClick={() => {
            void changeAppLocale(option.value)
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
