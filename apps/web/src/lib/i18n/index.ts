export * from './generateExperienceInterval'
// `reduceDataToLocale` and the shared locale types moved to @repo/utils; they are
// re-exported here so '@/lib/i18n' stays the single import site for the app.
// `translate` and `generateExperienceInterval` stay: both take Payload types.
export * from '@repo/utils/i18n/reduceDataToLocale'
export * from '@repo/utils/i18n/shared'
export * from './translate'
