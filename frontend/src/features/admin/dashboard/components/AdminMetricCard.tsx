import { Link } from 'react-router-dom'

interface AdminMetricCardProps {
  label: string
  value: string | number | null
  hint?: string
  loading?: boolean
  error?: boolean
  errorLabel?: string
  retryLabel?: string
  onRetry?: () => void
  href?: string
  hrefLabel?: string
}

export function AdminMetricCard({
  label,
  value,
  hint,
  loading = false,
  error = false,
  errorLabel,
  retryLabel,
  onRetry,
  href,
  hrefLabel,
}: AdminMetricCardProps) {
  return (
    <article className="admin-metric-card">
      <h3 className="admin-metric-card__label">{label}</h3>
      {loading ? (
        <p
          className="admin-metric-card__value admin-metric-card__value--muted"
          aria-live="polite"
        >
          …
        </p>
      ) : null}
      {error && !loading ? (
        <div className="admin-metric-card__error" role="alert">
          <p>{errorLabel}</p>
          {onRetry ? (
            <button type="button" className="btn btn--ghost" onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
        </div>
      ) : null}
      {!loading && !error ? (
        <p className="admin-metric-card__value">{value ?? '—'}</p>
      ) : null}
      {hint && !error ? <p className="admin-metric-card__hint">{hint}</p> : null}
      {href && hrefLabel ? (
        <p className="admin-metric-card__link">
          <Link to={href}>{hrefLabel}</Link>
        </p>
      ) : null}
    </article>
  )
}
