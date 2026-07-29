export interface ContactFormValues {
  full_name: string
  email: string
  phone: string
  organization: string
  message: string
  website: string
}

export interface SubmitContactMessagePayload {
  full_name: string
  email: string
  phone: string | null
  organization: string | null
  message: string
  website: string
}

export interface ContactMessageReceipt {
  id: number
  status: string
  created_at: string
}

export type ContactFieldErrors = Partial<
  Record<
    'full_name' | 'email' | 'phone' | 'organization' | 'message' | 'form',
    string
  >
>

export const FULL_NAME_MAX = 255
export const EMAIL_MAX = 255
export const PHONE_MAX = 50
export const ORGANIZATION_MAX = 255
export const MESSAGE_MAX = 5000
