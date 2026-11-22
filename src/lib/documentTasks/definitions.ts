import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * The tasks that redo, for one document, what its hooks trigger after a save: hooks queue them,
 * the edit view's menu runs them for that document, and the list view's menu (through the
 * `regenerate` task) runs them for every document of the collection.
 *
 * Plain data, free of server modules: the admin menu imports it.
 */
export const DOCUMENT_TASKS = [
  TaskSlug.GenerateMeta,
  TaskSlug.GenerateBlogPostExcerpt,
  TaskSlug.CalculateReadingTime,
  TaskSlug.ProcessImage,
  TaskSlug.GenerateVideoThumbnails,
  TaskSlug.GenerateDocumentThumbnails,
  TaskSlug.CalculateSkillTag,
  TaskSlug.SyncReferences,
  TaskSlug.RevalidateDocument,
] as const

export type DocumentTask = (typeof DOCUMENT_TASKS)[number]

export const isDocumentTask = (value: string): value is DocumentTask =>
  DOCUMENT_TASKS.some((task) => task === value)

export type DocumentTaskStep = {
  name: string
  label: string
}

export type DocumentTaskDefinition = {
  label: string
  /** What the confirmation tells the editor before queueing. */
  description: string
  /** Prefix of the job's concurrency key: `<keyPrefix>:<ref>`. */
  keyPrefix: string
  /** Where the task applies; `'tracked'` is every collection the references plugin tracks. */
  collections: string[] | 'tracked'
  /** Parts the editor can pick from; a task without steps always does all of its work. */
  steps: DocumentTaskStep[]
}

const MEDIA_COLLECTIONS = [
  CollectionSlug.MediaImages,
  CollectionSlug.MediaVideos,
  CollectionSlug.MediaFiles,
  CollectionSlug.MediaAudios,
]

export const DOCUMENT_TASK_DEFINITIONS: Record<DocumentTask, DocumentTaskDefinition> = {
  [TaskSlug.GenerateMeta]: {
    label: 'Regenerate meta data',
    description:
      'Renders the meta title from the Site Settings title template and has Claude write the meta description. Both replace the current values.',
    keyPrefix: 'generate-meta',
    collections: [CollectionSlug.Pages, CollectionSlug.BlogPosts, CollectionSlug.BlogTopics],
    steps: [
      {
        name: 'title',
        label: 'Meta title',
      },
      {
        name: 'description',
        label: 'Meta description (Claude)',
      },
    ],
  },
  [TaskSlug.GenerateBlogPostExcerpt]: {
    label: 'Regenerate excerpt',
    description: 'Has Claude write the excerpt from the content, replacing the current excerpt.',
    keyPrefix: 'generate-excerpt',
    collections: [CollectionSlug.BlogPosts],
    steps: [],
  },
  [TaskSlug.CalculateReadingTime]: {
    label: 'Recalculate reading time',
    description: 'Counts the words of the content and recalculates the reading time.',
    keyPrefix: 'calculate-reading-time',
    collections: [CollectionSlug.BlogPosts],
    steps: [],
  },
  [TaskSlug.ProcessImage]: {
    label: 'Regenerate image data',
    description: 'Processes the original file again.',
    keyPrefix: 'generate-image',
    collections: [CollectionSlug.MediaImages],
    steps: [
      {
        name: 'sizes',
        label: 'Image sizes',
      },
      {
        name: 'blur',
        label: 'Blur placeholder',
      },
      {
        name: 'alt',
        label: 'Alt text (Claude, replaces the current one)',
      },
    ],
  },
  [TaskSlug.GenerateVideoThumbnails]: {
    label: 'Regenerate poster frame',
    description: 'Extracts the poster frame of the video again, replacing the current one.',
    keyPrefix: 'generate-video-thumbnails',
    collections: [CollectionSlug.MediaVideos],
    steps: [],
  },
  [TaskSlug.GenerateDocumentThumbnails]: {
    label: 'Regenerate PDF thumbnails',
    description: 'Renders the page thumbnails of the PDF again, replacing the current ones.',
    keyPrefix: 'generate-document-thumbnails',
    collections: [CollectionSlug.MediaFiles],
    steps: [],
  },
  [TaskSlug.CalculateSkillTag]: {
    label: 'Recalculate skill tag',
    description: 'Recalculates the skill tag from the published jobs and skills using it.',
    keyPrefix: 'calculate-skill-tag',
    collections: [CollectionSlug.ResumeSkillTags],
    steps: [
      {
        name: 'interval',
        label: 'Interval (from jobs)',
      },
      {
        name: 'type',
        label: 'Type (from skills)',
      },
    ],
  },
  [TaskSlug.SyncReferences]: {
    label: 'Sync references',
    description:
      'Rewrites the reference index rows of the document, which the delete guard and the media credits read.',
    keyPrefix: 'sync-references',
    collections: 'tracked',
    steps: [],
  },
  [TaskSlug.RevalidateDocument]: {
    label: 'Revalidate cache',
    description: 'Clears the frontend cache entries that show the document.',
    keyPrefix: 'revalidate',
    collections: [
      ...MEDIA_COLLECTIONS,
      CollectionSlug.Pages,
      CollectionSlug.BlogPosts,
      CollectionSlug.BlogTopics,
      CollectionSlug.ResumeDocuments,
    ],
    steps: [],
  },
}

/** The step names a task may receive; `[]` for a task without steps. */
export const documentTaskStepNames = (task: DocumentTask): string[] =>
  DOCUMENT_TASK_DEFINITIONS[task].steps.map(({ name }) => name)

/**
 * The steps a job runs: the requested ones the task knows, or all of them when none were
 * requested (a hook or the collection runner asking for everything).
 */
export const resolveDocumentTaskSteps = (
  task: DocumentTask,
  requested: string[] | null | undefined,
): Set<string> => {
  const known = documentTaskStepNames(task)
  const picked = (requested ?? []).filter((step) => known.includes(step))

  return new Set(picked.length > 0 ? picked : known)
}

/**
 * A readable identifier for the concurrency key: the slug where the collection has one, the
 * filename of an upload, the id otherwise.
 */
export const resolveDocumentRef = (doc: {
  id: string | number
  slug?: string | null
  filename?: string | null
}): string => doc.slug || doc.filename || String(doc.id)

/**
 * `generate-image:hero.webp`; tasks spanning several collections put the collection in between
 * (`sync-references:posts:my-post`), since slugs only are unique within one collection.
 */
export const documentTaskKey = (
  task: DocumentTask,
  input: {
    collection: string
    ref?: string | null
    id: string
  },
): string => {
  const { keyPrefix, collections } = DOCUMENT_TASK_DEFINITIONS[task]
  const ref = input.ref || input.id

  return collections === 'tracked' || collections.length > 1
    ? `${keyPrefix}:${input.collection}:${ref}`
    : `${keyPrefix}:${ref}`
}

/** Whether a task applies to a collection; `'tracked'` tasks need `isReferenceTracked`. */
export const documentTaskAppliesTo = (
  task: DocumentTask,
  collection: string,
  isReferenceTracked: (collection: string) => boolean,
): boolean => {
  const { collections } = DOCUMENT_TASK_DEFINITIONS[task]

  return collections === 'tracked'
    ? isReferenceTracked(collection)
    : collections.includes(collection)
}
