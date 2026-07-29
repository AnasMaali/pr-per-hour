interface ProfileUpdateStatusProps {
  successMessage?: string | null
  errorMessage?: string | null
  requestId?: string | null
  requestIdLabel?: string
}

export function ProfileUpdateStatus({
  successMessage,
  errorMessage,
  requestId,
  requestIdLabel = 'Request ID',
}: ProfileUpdateStatusProps) {
  if (!successMessage && !errorMessage) return null

  if (successMessage) {
    return (
      <div className="profile-status profile-status--success" role="status" aria-live="polite">
        <p>{successMessage}</p>
      </div>
    )
  }

  return (
    <div className="profile-status profile-status--error" role="alert">
      <p>{errorMessage}</p>
      {requestId ? (
        <p className="profile-status__meta">
          {requestIdLabel}: <code>{requestId}</code>
        </p>
      ) : null}
    </div>
  )
}
