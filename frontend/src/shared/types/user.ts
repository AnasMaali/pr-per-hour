export type UserRole = 'admin' | 'client'
export type UserStatus = 'active' | 'inactive'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthTokenPayload {
  user: AuthUser
  token: string
  token_type: 'Bearer' | string
}
