import { useEffect, useState } from 'react'

export type HomeNavSpyKey = 'home' | 'about' | 'approach' | 'contact'

const SPY_SECTIONS: ReadonlyArray<{ key: HomeNavSpyKey; id: string | null }> = [
  { key: 'home', id: null },
  { key: 'about', id: 'about' },
  { key: 'approach', id: 'approach' },
  { key: 'contact', id: 'contact' },
]

/**
 * Tracks which homepage section is in view so the nav rail can follow scroll.
 * Does not mutate the URL hash (avoids fighting hash-scroll navigation).
 */
export function useHomeNavSpy(enabled: boolean): HomeNavSpyKey | null {
  const [active, setActive] = useState<HomeNavSpyKey | null>(
    enabled ? 'home' : null,
  )

  useEffect(() => {
    if (!enabled) {
      setActive(null)
      return
    }

    const compute = () => {
      const header = document.querySelector<HTMLElement>('.public-header')
      const headerH = header?.getBoundingClientRect().height ?? 80
      const marker =
        window.scrollY + headerH + Math.min(100, window.innerHeight * 0.12)

      let current: HomeNavSpyKey = 'home'

      for (const section of SPY_SECTIONS) {
        if (!section.id) continue
        const el = document.getElementById(section.id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (top <= marker) current = section.key
      }

      setActive((prev) => (prev === current ? prev : current))
    }

    let raf = 0
    const onScroll = () => {
      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled])

  return enabled ? active : null
}
