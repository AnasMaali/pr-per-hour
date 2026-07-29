export interface ProfileFormValues {
  name: string
  phone: string
}

export type ProfileFieldErrors = Partial<
  Record<'name' | 'phone' | 'form', string>
>

export interface ProfileUpdatePayload {
  name: string
  phone: string | null
}
