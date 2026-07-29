import { useEffect } from 'react'

export interface DocumentMetaOptions {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  /** e.g. "noindex, nofollow" for auth/error pages */
  robots?: string
  /** When true, sync theme-color from the active `--color-bg` token. */
  syncThemeColor?: boolean
}

function upsertMeta(selector: string, attributes: Record<string, string>): void {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }
}

function readCssColor(variableName: string): string | null {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()
  return value || null
}

/**
 * Lightweight document metadata helper.
 * Production canonical URLs and locale route strategy remain deferred.
 */
export function useDocumentMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  robots,
  syncThemeColor = false,
}: DocumentMetaOptions): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    })
    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: ogTitle ?? title,
    })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: ogDescription ?? description,
    })

    if (robots) {
      upsertMeta('meta[name="robots"]', {
        name: 'robots',
        content: robots,
      })
    }

    if (syncThemeColor) {
      const themeColor = readCssColor('--color-bg')
      if (themeColor) {
        upsertMeta('meta[name="theme-color"]', {
          name: 'theme-color',
          content: themeColor,
        })
      }
    }

    return () => {
      document.title = previousTitle
    }
  }, [title, description, ogTitle, ogDescription, robots, syncThemeColor])
}
