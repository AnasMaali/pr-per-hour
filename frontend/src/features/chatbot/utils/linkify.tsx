import type { ReactNode } from 'react'

/**
 * Plain-text-first message rendering: Anas's replies are never trusted as
 * HTML. This only ever produces text nodes and safe `<a>` elements with a
 * fixed http(s) scheme — never `dangerouslySetInnerHTML`, never an
 * arbitrary `href`.
 */
const URL_SPLIT_PATTERN = /(https?:\/\/[^\s<>"'\]]+|www\.[^\s<>"'\]]+)/g
const URL_TEST_PATTERN = /^(https?:\/\/[^\s<>"'\]]+|www\.[^\s<>"'\]]+)$/i
const TRAILING_PUNCTUATION_PATTERN = /[.,!?;:)\]'"]+$/

function splitTrailingPunctuation(url: string): [string, string] {
  const match = TRAILING_PUNCTUATION_PATTERN.exec(url)
  if (!match) return [url, '']
  return [url.slice(0, url.length - match[0].length), match[0]]
}

export function renderMessageContent(text: string): ReactNode[] {
  return text
    .split(URL_SPLIT_PATTERN)
    .map((part, index): ReactNode => {
      if (part === '') return null

      if (!URL_TEST_PATTERN.test(part)) {
        return <span key={index}>{part}</span>
      }

      const [url, trailing] = splitTrailingPunctuation(part)
      const href = url.startsWith('www.') ? `https://${url}` : url

      return (
        <span key={index}>
          <a href={href} target="_blank" rel="noopener noreferrer nofollow">
            {url}
          </a>
          {trailing}
        </span>
      )
    })
    .filter((node): node is ReactNode => node !== null)
}
