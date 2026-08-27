export {
  type HighlightCodeOptions,
  highlightCode,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from './highlightCode'

// `highlightCodeCached` is deliberately not part of this package: it imports
// `next/cache`, which would drag a Next.js dependency into a framework-free
// utils package (and cannot be resolved from a client component anyway). It
// stays in the app — import '@/lib/shiki/highlightCodeCached' directly in
// Server Components.
