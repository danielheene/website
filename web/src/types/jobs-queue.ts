import { RegisteredGlobalSlug } from '@/types/globals'

export const TaskSlug = {
  GenerateResumeLocalizedData: 'GenerateResumeDocumentLocalizedData',
  GenerateResumeLocalizedFile: 'GenerateResumeDocumentLocalizedFile',
  GenerateResumeLocalizedThumbnails: 'GenerateResumeDocumentLocalizedThumbnails',
  GenerateResumeDocumentEntry: 'GenerateResumeDocumentEntry',
  RemoveLatestFlagsFromPreviousEntries: 'RemoveLatestFlagsFromPreviousEntries',
} as const

export type TaskSlug = typeof TaskSlug
export type TaskSlugKey = keyof  TaskSlug & string
export type TaskSlugValue = typeof TaskSlug[TaskSlugKey] & string

export const WorkflowSlug = {
  GenerateResumeDocument: 'GenerateResumeDocument',
} as const


export type WorkflowSlug = typeof WorkflowSlug
export type WorkflowSlugKey = keyof WorkflowSlug & string
export type WorkflowSlugValue = typeof WorkflowSlug[WorkflowSlugKey] & string

export const QueueSlug = {
  Default: 'default',
  ResumeGenerator: 'resume-generator',
} as const

export type QueueSlug = typeof QueueSlug
export type QueueSlugKey = keyof QueueSlug & string
export type QueueSlugValue = typeof QueueSlug[QueueSlugKey] & string

