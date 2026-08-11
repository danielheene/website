import { CollectionSlug, CollectionSlugValue } from '@/types/collections'
import { GlobalSlug, GlobalSlugValue } from '@/types/globals'

export const AdminGroup = {
  Resume: 'resume',
  Blog: 'blog',
  Media: 'media',
  General: 'general',
  Settings: 'settings',
} as const

export type AdminGroup = typeof AdminGroup
export type AdminGroupKey = keyof AdminGroup & string
export type AdminGroupValue = AdminGroup[AdminGroupKey] & string

export const AdminNavigationType = {
  Collection: 'collections',
  Global: 'globals',
} as const

export type AdminNavigationType = typeof AdminNavigationType
export type AdminNavigationTypeKey = keyof AdminNavigationType & string
export type AdminNavigationTypeValue = AdminNavigationType[AdminNavigationTypeKey] & string

export type AdminNavigationGroup = {
  group: AdminGroupValue
  label: false | string
  className?: string
  entries: AdminNavigationEntry[]
}

export type AdminNavigationEntry = {
  icon: string
  label: string
} & (
  | {
      type: AdminNavigationType['Collection']
      slug: CollectionSlugValue
    }
  | {
      type: AdminNavigationType['Global']
      slug: GlobalSlugValue
    }
)

export const AdminPanelNavigation: AdminNavigationGroup[] = [
  {
    group: AdminGroup.General,
    label: false,
    entries: [
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.Pages,
        label: 'Pages',
        icon: 'material-symbols:pages-outline-sharp',
      },
    ],
  },
  {
    group: AdminGroup.Blog,
    label: 'Blog',
    entries: [
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.BlogPosts,
        label: 'Posts',
        icon: 'material-symbols:post-outline',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.BlogTopics,
        label: 'Topics',
        icon: 'material-symbols:label-outline-sharp',
      },
    ],
  },
  {
    group: AdminGroup.Resume,
    label: 'Resume',
    entries: [
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.ResumeJobs,
        label: 'Jobs',
        icon: 'material-symbols:work-outline-sharp',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.ResumeSkills,
        label: 'Skills',
        icon: 'ri:user-line',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.ResumeSkillTags,
        label: 'Skill Tags',
        icon: 'ri:user-line',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.ResumeCustomers,
        label: 'Customers',
        icon: 'material-symbols:deployed-code-account-outline-sharp',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.ResumeProjects,
        label: 'Projects',
        icon: 'material-symbols:experiment-outline-sharp',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.ResumeDocuments,
        label: 'Documents',
        icon: 'material-symbols:article-outline-sharp',
      },
    ],
  },
  {
    group: AdminGroup.Media,
    label: 'Media',
    entries: [
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.MediaImages,
        label: 'Images',
        icon: 'ri:file-image-line',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.MediaVideos,
        label: 'Videos',
        icon: 'ri:file-video-line',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.MediaAudios,
        label: 'Audios',
        icon: 'ri:file-music-line',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.MediaDocuments,
        label: 'Documents',
        icon: 'ri:file-text-line',
      },
    ],
  },
  {
    group: AdminGroup.Settings,
    label: 'Settings',
    className: 'mt-auto',
    entries: [
      {
        type: AdminNavigationType.Global,
        slug: GlobalSlug.SiteSettings,
        label: 'Site Settings',
        icon: 'material-symbols:settings',
      },
      {
        type: AdminNavigationType.Global,
        slug: GlobalSlug.GlobalUserSettings,
        label: 'Global User',
        icon: 'material-symbols:person-edit',
      },
      {
        type: AdminNavigationType.Global,
        slug: GlobalSlug.PDFGeneratorSettings,
        label: 'PDF Generator',
        icon: 'material-symbols:build',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.Redirects,
        label: 'Redirects',
        icon: 'material-symbols:step-over',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.DocumentReferences,
        label: 'Document References',
        icon: 'material-symbols:network-node',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.PayloadJobs,
        label: 'Payload Jobs',
        icon: 'material-symbols:stacks',
      },
      {
        type: AdminNavigationType.Collection,
        slug: CollectionSlug.Users,
        label: 'Users',
        icon: 'material-symbols:account-box-outline-sharp',
      },
    ],
  },
]
