export {
  type HighlightCodeOptions,
  highlightCode,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from './highlightCode'

// `highlightCodeCached` is deliberately not re-exported here: it imports
// `next/cache`, which cannot be resolved from a client component, and this
// barrel is reachable from client code. Import it from
// '@/lib/shiki/highlightCodeCached' directly in Server Components.
