import { Fragment } from 'react'
import { cn } from '@/shared/utils/cn'

type HeroSweepTextProps = {
  text: string
  className?: string
  as?: 'span' | 'p' | 'h1'
  id?: string
}

/**
 * Lightweight word spans for scroll-driven top→bottom color fill.
 * One visible glyph per word — no duplicated text layers.
 * GSAP animates `--fill-progress` (0→1) on `.hero-word`.
 */
export function HeroSweepText({
  text,
  className,
  as: Tag = 'span',
  id,
}: HeroSweepTextProps) {
  const parts = text.split(/(\s+)/)

  return (
    <Tag id={id} className={cn('hero-word-line', className)}>
      {parts.map((part, index) => {
        if (/^\s+$/.test(part)) {
          return <Fragment key={`s-${index}`}>{part}</Fragment>
        }
        if (!part) return null
        return (
          <span key={`w-${index}`} className="hero-word">
            {part}
          </span>
        )
      })}
    </Tag>
  )
}
