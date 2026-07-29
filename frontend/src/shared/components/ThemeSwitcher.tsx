import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useReducedMotion } from '@/shared/motion'
import { cn } from '@/shared/utils/cn'

interface ThemeSwitcherProps {
  className?: string
}

/**
 * Compact Light / Dark toggle (System removed from the UI).
 * Legacy stored "system" is normalized to an explicit mode on bootstrap.
 */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { t } = useTranslation('common')
  const { preference, setPreference } = useTheme()
  const reducedMotion = useReducedMotion()
  const isDark = preference === 'dark'

  return (
    <button
      type="button"
      className={cn(
        'theme-toggle',
        isDark && 'theme-toggle--dark',
        reducedMotion && 'theme-toggle--reduced',
        className,
      )}
      role="switch"
      aria-checked={isDark}
      aria-label={t('appearance')}
      title={isDark ? t('themeDark') : t('themeLight')}
      onClick={() => setPreference(isDark ? 'light' : 'dark')}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={14} />
        <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={14} />
        <span className="theme-toggle__thumb" />
      </span>
      <span className="visually-hidden">
        {isDark ? t('themeDark') : t('themeLight')}
      </span>
    </button>
  )
}
