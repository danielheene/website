/**
 * Protocols a custom link target may use. Deliberately narrow: anything
 * script-bearing (`javascript:`, `data:`) must never reach an href built from
 * editor input.
 */
const ALLOWED_PROTOCOLS = [
  'http:',
  'https:',
  'mailto:',
  'tel:',
]

/**
 * Whether a string is acceptable as a custom link target.
 *
 * Accepts absolute http(s), `mailto:`, `tel:`, root-relative paths and bare
 * fragments. Protocol-relative URLs (`//host`) are rejected — they read as
 * root-relative but resolve off-site.
 */
export const isValidCustomURL = (value: unknown): boolean => {
  if (typeof value !== 'string') return false

  const trimmed = value.trim()
  if (!trimmed) return false

  if (trimmed.startsWith('//')) return false
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true

  try {
    return ALLOWED_PROTOCOLS.includes(new URL(trimmed).protocol)
  } catch {
    return false
  }
}
