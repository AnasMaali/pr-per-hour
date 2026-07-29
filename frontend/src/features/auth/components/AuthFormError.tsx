interface AuthFormErrorProps {
  message: string
  requestId?: string | null
  requestIdLabel: string
}

export function AuthFormError({
  message,
  requestId,
  requestIdLabel,
}: AuthFormErrorProps) {
  return (
    <div className="auth-form-error" role="alert" tabIndex={-1} id="auth-form-error">
      <p>{message}</p>
      {requestId ? (
        <p className="auth-form-error__meta">
          <span>{requestIdLabel}: </span>
          <code>{requestId}</code>
        </p>
      ) : null}
    </div>
  )
}
