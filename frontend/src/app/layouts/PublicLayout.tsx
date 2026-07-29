import { Outlet, useLocation } from 'react-router-dom'
import { SkipLink } from '@/shared/components/SkipLink'
import { PublicFooter } from '@/app/layouts/public/PublicFooter'
import { PublicHeader } from '@/app/layouts/public/PublicHeader'
import { RouteTransition } from '@/shared/motion'
import { cn } from '@/shared/utils/cn'
import '@/app/layouts/public/public-layout.css'
import '@/shared/motion/styles/motion.css'

export function PublicLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isFullBleed =
    isHome ||
    location.pathname === '/contact' ||
    location.pathname === '/services'

  return (
    <div className="app-shell public-shell">
      <SkipLink />
      <PublicHeader />

      <main
        id="main-content"
        className={cn('public-main', isFullBleed && 'public-main--full')}
        tabIndex={-1}
      >
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </main>

      <PublicFooter />
    </div>
  )
}
