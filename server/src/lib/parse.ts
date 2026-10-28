/** Reads a trimmed string from a JSON body, or returns `null`. */
export function readString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > maxLength) return null
  return trimmed
}

/** Reads an optional trimmed string, treating blank as absent. */
export function readOptionalString(value: unknown, maxLength: number) {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.length > maxLength) return null
  return trimmed
}

/** Accepts a web address with or without its scheme and normalises it. */
export function readUrl(value: unknown) {
  const raw = readString(value, 2048)
  if (!raw) return null
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}
