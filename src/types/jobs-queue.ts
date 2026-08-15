export const TaskSlug = {
  GenerateDocumentThumbnails: 'GenerateDocumentThumbnails',
  GenerateVideoThumbnails: 'GenerateVideoThumbnails',
  CalculateSkillTagInterval: 'CalculateSkillTagInterval',
  GenerateLocalizedResumeDocument: 'GenerateLocalizedResumeDocument',
  GenerateResumeFilename: 'GenerateResumeFilename',
  BuildLocalizedResumeData: 'BuildLocalizedResumeData',
  GenerateResumeFile: 'GenerateResumeFile',
  GenerateResumeDocumentTitle: 'GenerateResumeDocumentTitle',
  GenerateResumeDocumentSlug: 'GenerateResumeDocumentSlug',
  CreateResumeDocument: 'CreateResumeDocument',
  PingUptimeEndpoint: 'PingUptimeEndpoint',
} as const

export type TaskSlug = typeof TaskSlug
export type TaskSlugKey = keyof TaskSlug & string
export type TaskSlugValue = TaskSlug[TaskSlugKey] & string

export const WorkflowSlug = {
  GenerateResumeDocument: 'GenerateResumeDocument',
} as const

export type WorkflowSlug = typeof WorkflowSlug
export type WorkflowSlugKey = keyof WorkflowSlug & string
export type WorkflowSlugValue = WorkflowSlug[WorkflowSlugKey] & string

export const QueueSlug = {
  Default: 'default',
  ResumeGeneration: 'resume-generation',
} as const

export type QueueSlug = typeof QueueSlug
export type QueueSlugKey = keyof QueueSlug & string
export type QueueSlugValue = QueueSlug[QueueSlugKey] & string
