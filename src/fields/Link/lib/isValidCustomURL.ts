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
 * Placeholder origin used to resolve relative candidates. `.invalid` is
 * reserved by RFC 2606 and can never resolve to a real host, so a candidate
 * that stays on this origin is guaranteed to stay on whatever origin the site
 * is actually served from.
 */
const RELATIVE_BASE = 'https://link-validation.invalid'

/**
 * Whether a string is acceptable as a custom link target.
 *
 * Accepts absolute `http:`/`https:`/`mailto:`/`tel:` URLs, root-relative paths
 * and bare fragments. Everything else is rejected.
 *
 * The guarantee for the relative forms is decided by the URL parser rather
 * than by inspecting characters: the candidate is resolved against a
 * placeholder origin and accepted only if it lands back on that origin. A
 * value therefore cannot escape to a foreign host through any normalization
 * step the parser performs — backslash-to-slash rewriting, stripping of tab,
 * LF and CR, dot-segment removal — because the check reads the parser's
 * verdict on where the value points instead of guessing from its spelling.
 * Characters that survive normalization as ordinary path bytes (a backslash
 * inside a path, a percent-encoded slash) are harmless and stay accepted.
 *
 * Absolute URLs are gated on their protocol instead: `mailto:` and `tel:` are
 * opaque and report an origin of `"null"`, so an origin comparison would be
 * meaningless for them.
 */
export const isValidCustomURL = (value: unknown): boolean => {
  if (typeof value !== 'string') return false

  const candidate = value.trim()
  if (!candidate) return false

  try {
    if (candidate.startsWith('/') || candidate.startsWith('#')) {
      return new URL(candidate, RELATIVE_BASE).origin === RELATIVE_BASE
    }

    return ALLOWED_PROTOCOLS.includes(new URL(candidate).protocol)
  } catch {
    return false
  }
}
