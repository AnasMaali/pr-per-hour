import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useInView } from '@/shared/motion/hooks/useInView'
import { cn } from '@/shared/utils/cn'

interface StaggerGroupProps {
  children: ReactNode
  className?: string
  /** Stagger step in ms (default 70). */
  stepMs?: number
  as?: 'div' | 'ul' | 'ol'
}

/**
 * Applies staggered reveal delays to direct children that accept className/style.
 * Observer attaches to a stable wrapper; semantic list tags remain available via `as`.
 */
export function StaggerGroup({
  children,
  className,
  stepMs = 70,
  as = 'div',
}: StaggerGroupProps) {
  const [ref, inView] = useInView<HTMLDivElement>()

  const items = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child
    const element = child as ReactElement<{
      className?: string
      style?: CSSProperties
    }>
    const style = {
      ...element.props.style,
      '--stagger-index': index,
      '--stagger-step': `${stepMs}ms`,
    } as CSSProperties
    return cloneElement(element, {
      className: cn('motion-stagger__item', element.props.className),
      style,
    })
  })

  return (
    <div
      ref={ref}
      className={cn('motion-stagger', inView && 'is-visible')}
    >
      {as === 'div'
        ? createElement('div', { className }, items)
        : createElement(as, { className }, items)}
    </div>
  )
}
