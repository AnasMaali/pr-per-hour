export function validateCreatedDateRange(
  createdFrom: string,
  createdTo: string,
): string | null {
  if (!createdFrom || !createdTo) return null
  if (createdFrom > createdTo) return 'validationDateRange'
  return null
}

export function normalizeEmailFilter(value: string): string {
  return value.trim().toLowerCase()
}
