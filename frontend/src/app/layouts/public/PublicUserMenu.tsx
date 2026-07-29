import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { cn } from '@/shared/utils/cn'

interface PublicUserMenuProps {
  className?: string
  onNavigate?: () => void
  mobile?: boolean
}

/**
 * Authenticated account menu for the public header.
 * Reuses AuthProvider logout; no duplicated auth logic.
 */
export function PublicUserMenu({
  className,
  onNavigate,
  mobile = false,
}: PublicUserMenuProps) {
  const { t } = useTranslation(['navigation', 'common'])
  const { isAdmin, isClient, logout, user } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const triggerId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!isAdmin && !isClient) {
    return null
  }

  const primaryLabel = isAdmin
    ? t('navigation:adminDashboard')
    : t('navigation:myAccount')
  const primaryTo = isAdmin ? '/admin' : '/dashboard'

  function handleNavigate() {
    setOpen(false)
    onNavigate?.()
  }

  async function handleLogout() {
    setOpen(false)
    onNavigate?.()
    await logout()
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
    }
  }

  if (mobile) {
    return (
      <div className={cn('public-user-menu public-user-menu--mobile', className)}>
        <p className="public-user-menu__identity">
          <span className="public-user-menu__name">{user?.name}</span>
          <span className="public-user-menu__email">{user?.email}</span>
        </p>
        <ul className="public-user-menu__list">
          <li>
            <Link to={primaryTo} onClick={handleNavigate}>
              {primaryLabel}
            </Link>
          </li>
          <li>
            <Link to="/" onClick={handleNavigate}>
              {t('navigation:home')}
            </Link>
          </li>
          <li>
            <button type="button" onClick={() => void handleLogout()}>
              {t('navigation:logout')}
            </button>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={cn('public-user-menu', open && 'is-open', className)}
    >
      <button
        id={triggerId}
        type="button"
        className="public-user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="public-user-menu__trigger-label">{primaryLabel}</span>
        <ChevronDown aria-hidden="true" size={16} />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-labelledby={triggerId}
        className={cn('public-user-menu__panel', open && 'is-open')}
        hidden={!open}
      >
        <Link
          role="menuitem"
          to={primaryTo}
          className="public-user-menu__item"
          onClick={handleNavigate}
        >
          {primaryLabel}
        </Link>
        <Link
          role="menuitem"
          to="/"
          className="public-user-menu__item"
          onClick={handleNavigate}
        >
          {t('navigation:home')}
        </Link>
        <button
          type="button"
          role="menuitem"
          className="public-user-menu__item public-user-menu__item--danger"
          onClick={() => void handleLogout()}
        >
          {t('navigation:logout')}
        </button>
      </div>
    </div>
  )
}
