import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '@/shared/motion/hooks/useInView'
import { cn } from '@/shared/utils/cn'

export type RevealVariant = 'up' | 'fade' | 'scale'

interface RevealProps {
  children: ReactNode
  className?: string
  variant?: RevealVariant
  delayMs?: number
}

export function Reveal({
  children,
  className,
  variant = 'up',
  delayMs = 0,
}: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>()

  const style = {
    '--reveal-delay': `${delayMs}ms`,
  } as CSSProperties

  return (
    <div
      ref={ref}
      className={cn(
        'motion-reveal',
        `motion-reveal--${variant}`,
        inView && 'is-visible',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  )
}
