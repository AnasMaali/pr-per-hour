interface AuthHeaderProps {
  title: string
  subtitle: string
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <header className="auth-header">
      <h1 className="auth-header__title">{title}</h1>
      <p className="auth-header__subtitle">{subtitle}</p>
    </header>
  )
}
