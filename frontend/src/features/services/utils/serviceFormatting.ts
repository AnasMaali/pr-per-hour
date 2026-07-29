export function formatServicePrice(price: string, currency: string): string {
  const safePrice = price?.trim() || '0.00'
  const safeCurrency = currency?.trim().toUpperCase() || 'USD'
  return `${safePrice} ${safeCurrency}`
}

export function formatServiceDuration(
  minutes: number | null | undefined,
  template: (values: { minutes: number }) => string,
  emptyLabel: string,
): string {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) {
    return emptyLabel
  }
  return template({ minutes })
}

export function truncateText(text: string | null | undefined, max = 160): string {
  if (!text) return ''
  const normalized = text.trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1).trimEnd()}…`
}
