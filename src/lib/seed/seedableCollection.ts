export const SEEDABLE_COLLECTIONS = ['pages', 'posts', 'topics'] as const

export type SeedableCollection = (typeof SEEDABLE_COLLECTIONS)[number]
