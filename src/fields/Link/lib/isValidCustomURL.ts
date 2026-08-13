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
 * fragments. Rejects anything that can resolve off-site while looking
 * same-origin: protocol-relative URLs (`//host`), and any relative value
 * containing a backslash. Browsers normalize `\` to `/` for special schemes
 * (per the WHATWG URL spec), so `/\evil.com` and `\/evil.com` resolve to
 * `//evil.com` at the browser even though neither starts with `//` as
 * written — a relative value has no legitimate use for a backslash, so any
 * backslash is treated as hostile rather than normalized.
 */
export const isValidCustomURL = (value: unknown): boolean => {
  if (typeof value !== 'string') return false

  const trimmed = value.trim()
  if (!trimmed) return false

  if (trimmed.startsWith('//')) return false
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return !trimmed.includes('\\')
  }

  try {
    const url = new URL(trimmed)
    return ALLOWED_PROTOCOLS.includes(url.protocol)
  } catch {
    return false
  }
}
