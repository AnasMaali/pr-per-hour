import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyDocumentTheme,
  persistTheme,
  resolveInitialThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemeMode,
} from '@/shared/lib/theme'

interface ThemeContextValue {
  preference: ThemeMode
  resolved: ResolvedTheme
  setPreference: (preference: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemeMode>(() =>
    resolveInitialThemePreference(),
  )
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolveTheme(resolveInitialThemePreference()),
  )

  const setPreference = useCallback((next: ThemeMode) => {
    setPreferenceState(next)
    persistTheme(next)
    const nextResolved = resolveTheme(next)
    setResolved(nextResolved)
    applyDocumentTheme(next, nextResolved)
  }, [])

  useEffect(() => {
    applyDocumentTheme(preference, resolved)
  }, [preference, resolved])

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
