import { CollectionSlug } from '@/types/collections'

/** Collections that must never be scanned — the table itself, plus churn-heavy internals. */
export const ALWAYS_EXCLUDED = new Set<string>([
  CollectionSlug.DocumentReferences,
  CollectionSlug.PayloadJobs,
  CollectionSlug.PayloadKVS,
  CollectionSlug.PayloadLockedDocuments,
  CollectionSlug.PayloadMigrations,
  CollectionSlug.PayloadPreferences,
  CollectionSlug.PayloadQueryPresets,
  CollectionSlug.PayloadFolders,
])

export const isReferenceTracked = (collection: string): boolean => !ALWAYS_EXCLUDED.has(collection)
