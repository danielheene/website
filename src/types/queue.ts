export const TaskSlug = {
  GenerateResumeLocalizedData: 'GenerateResumeDocumentLocalizedData',
  GenerateResumeLocalizedFile: 'GenerateResumeDocumentLocalizedFile',
  GenerateResumeLocalizedThumbnails: 'GenerateResumeDocumentLocalizedThumbnails',
  GenerateResumeDocumentEntry: 'GenerateResumeDocumentEntry',
  RemoveLatestFlagsFromPreviousEntries: 'RemoveLatestFlagsFromPreviousEntries',
} as const

export type TaskSlug = typeof TaskSlug

export const WorkflowSlug = {
  GenerateResumeDocument: 'GenerateResumeDocument',
} as const

export type WorkflowSlug = typeof WorkflowSlug

export const QueueSlug = {
  Default: 'default',
  ResumeGenerator: 'resume-generator',
} as const

export type QueueSlug = typeof QueueSlug
