/**
 * String values follow Payload's own internal task-slug convention
 * (`schedulePublish`, `singleTask`, …): lowerCamelCase, not PascalCase — only
 * the enum keys stay PascalCase for readability at call sites
 * (`TaskSlug.GenerateDocumentThumbnails`).
 */
export const TaskSlug = {
  GenerateDocumentThumbnails: 'generateDocumentThumbnails',
  GenerateVideoThumbnails: 'generateVideoThumbnails',
  CalculateSkillTagInterval: 'calculateSkillTagInterval',
  GenerateLocalizedResumeDocument: 'generateLocalizedResumeDocument',
  GenerateResumeFilename: 'generateResumeFilename',
  BuildLocalizedResumeData: 'buildLocalizedResumeData',
  GenerateResumeFile: 'generateResumeFile',
  GenerateResumeDocumentTitle: 'generateResumeDocumentTitle',
  CreateResumeDocument: 'createResumeDocument',
  HeartbeatPing: 'heartbeatPing',
  AutoTranslateBilingualField: 'autoTranslateBilingualField',
  SeedCollection: 'seedCollection',
  SyncSkillSorting: 'syncSkillSorting',
} as const

export type TaskSlug = typeof TaskSlug
export type TaskSlugKey = keyof TaskSlug & string
export type TaskSlugValue = TaskSlug[TaskSlugKey] & string

/** String values follow the same lowerCamelCase convention as {@link TaskSlug}. */
export const WorkflowSlug = {
  GenerateResumeDocument: 'generateResumeDocument',
} as const

export type WorkflowSlug = typeof WorkflowSlug
export type WorkflowSlugKey = keyof WorkflowSlug & string
export type WorkflowSlugValue = WorkflowSlug[WorkflowSlugKey] & string

/**
 * String values follow Payload's own queue naming (its default queue is
 * literally `'default'`): dashed, lowercase, no `Queue` suffix.
 */
export const QueueSlug = {
  Default: 'default',
  HookHandler: 'hook-handler',
  ResumeGeneration: 'resume-generation',
  Heartbeat: 'heartbeat',
} as const

export type QueueSlug = typeof QueueSlug
export type QueueSlugKey = keyof QueueSlug & string
export type QueueSlugValue = QueueSlug[QueueSlugKey] & string
