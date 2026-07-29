import { useEffect, useState } from 'react'
import {
  pendingAuthStorage,
  type PendingAuthPurpose,
} from '@/features/auth/utils/pendingAuthStorage'

/** Tick remaining resend cooldown seconds from sessionStorage. */
export function useResendCountdown(purpose: PendingAuthPurpose): number {
  const [seconds, setSeconds] = useState(() =>
    pendingAuthStorage.secondsUntilResend(purpose),
  )

  useEffect(() => {
    setSeconds(pendingAuthStorage.secondsUntilResend(purpose))
    const id = window.setInterval(() => {
      setSeconds(pendingAuthStorage.secondsUntilResend(purpose))
    }, 250)
    return () => window.clearInterval(id)
  }, [purpose])

  return seconds
}
