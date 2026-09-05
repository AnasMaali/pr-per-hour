import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// vitest.config.ts does not enable `test.globals`, so Testing Library's
// own auto-cleanup (which only registers when `afterEach` is a global)
// never fires. Without this, DOM from one test leaks into the next.
afterEach(() => {
  cleanup()
})

/**
 * jsdom does not implement matchMedia. Shared hooks (useReducedMotion,
 * theme resolution) call it unconditionally, so tests need a safe stub.
 */
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList
  }
}

/** jsdom does not implement IntersectionObserver (used by useInView). */
if (typeof window.IntersectionObserver !== 'function') {
  function MockIntersectionObserver() {
    return {
      root: null,
      rootMargin: '',
      thresholds: [],
      scrollMargin: '',
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
      takeRecords: () => [],
    }
  }

  window.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver
}

/** jsdom does not implement scrollIntoView (used by smart-scroll behavior). */
if (typeof window.HTMLElement.prototype.scrollIntoView !== 'function') {
  window.HTMLElement.prototype.scrollIntoView = () => {}
}

/** jsdom does not implement Element.scrollTo (used by smart-scroll behavior). */
if (typeof window.HTMLElement.prototype.scrollTo !== 'function') {
  window.HTMLElement.prototype.scrollTo = () => {}
}
