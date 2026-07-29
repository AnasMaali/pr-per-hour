import { clsx, type ClassValue } from 'clsx'

/** Lightweight className merger for shared components. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}
