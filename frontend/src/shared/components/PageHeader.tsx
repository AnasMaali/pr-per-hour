import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  titleId?: string
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  titleId,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
      <div className="cluster" style={{ justifyContent: 'space-between' }}>
        <div className="stack" style={{ gap: 'var(--space-2)' }}>
          <h1 id={titleId}>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions}
      </div>
    </header>
  )
}
