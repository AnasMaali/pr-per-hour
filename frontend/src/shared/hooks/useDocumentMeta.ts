import { useEffect } from 'react'

const SITE_ORIGIN = 'https://prperhour.com'
const SITE_NAME = 'PR Per Hour'

export interface DocumentMetaOptions {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string

  /** Public canonical path, e.g. "/", "/services", "/contact". */
  canonicalPath?: string

  /** e.g. "noindex, nofollow" for auth/error pages */
  robots?: string

  /** Structured data rendered as JSON-LD. */
  structuredData?: Record<string, unknown> | Record<string, unknown>[]

  /** When true, sync theme-color from the active `--color-bg` token. */
  syncThemeColor?: boolean
}

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
): HTMLMetaElement {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }

  return element
}

function upsertLink(
  selector: string,
  attributes: Record<string, string>,
): HTMLLinkElement {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null

  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value)
  }

  return element
}

function canonicalUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`

  return new URL(normalized, SITE_ORIGIN).toString()
}

function readCssColor(variableName: string): string | null {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()

  return value || null
}

export function useDocumentMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  canonicalPath,
  robots,
  structuredData,
  syncThemeColor = false,
}: DocumentMetaOptions): void {
  const structuredDataJson = structuredData
    ? JSON.stringify(structuredData)
    : null

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

    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: SITE_NAME,
    })

    if (canonicalPath) {
      const url = canonicalUrl(canonicalPath)

      upsertLink('link[rel="canonical"]', {
        rel: 'canonical',
        href: url,
      })

      upsertMeta('meta[property="og:url"]', {
        property: 'og:url',
        content: url,
      })
    } else {
      document.head.querySelector('link[rel="canonical"]')?.remove()
      document.head.querySelector('meta[property="og:url"]')?.remove()
    }

    if (robots) {
      upsertMeta('meta[name="robots"]', {
        name: 'robots',
        content: robots,
      })
    } else {
      document.head.querySelector('meta[name="robots"]')?.remove()
    }

    if (structuredDataJson) {
      let script = document.head.querySelector(
        'script[data-prph-structured-data]',
      ) as HTMLScriptElement | null

      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute('data-prph-structured-data', 'true')
        document.head.appendChild(script)
      }

      script.textContent = structuredDataJson
    } else {
      document.head
        .querySelector('script[data-prph-structured-data]')
        ?.remove()
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

      if (structuredDataJson) {
        document.head
          .querySelector('script[data-prph-structured-data]')
          ?.remove()
      }
    }
  }, [
    title,
    description,
    ogTitle,
    ogDescription,
    canonicalPath,
    robots,
    structuredDataJson,
    syncThemeColor,
  ])
}
