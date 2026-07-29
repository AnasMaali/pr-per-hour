import type { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
}

export function AuthCard({ children }: AuthCardProps) {
  return <div className="auth-card">{children}</div>
}
