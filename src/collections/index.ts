import type { CollectionSlug } from 'payload'

import { BlogPosts } from '@/collections/BlogPosts'
import { BlogTopics } from '@/collections/BlogTopics'
import { MediaAudios } from '@/collections/MediaAudios'
import { MediaDocuments } from '@/collections/MediaDocuments'
import { MediaImages } from '@/collections/MediaImages'
import { MediaVideos } from '@/collections/MediaVideos'
import { Pages } from '@/collections/Pages'
import { ResumeCustomers } from '@/collections/ResumeCustomers'
import { ResumeDocuments } from '@/collections/ResumeDocuments'
import { ResumeJobs } from '@/collections/ResumeJobs'
import { ResumeProjects } from '@/collections/ResumeProjects'
import { ResumeSkills } from '@/collections/ResumeSkills'
import { ResumeSkillTags } from '@/collections/ResumeSkillTags'
import { Users } from '@/collections/Users'

export const COLLECTIONS = [
  BlogPosts,
  BlogTopics,
  Pages,
  Users,

  /* Media Upload Collections */
  MediaImages,
  MediaVideos,
  MediaDocuments,
  MediaAudios,

  /* Resume Collections */
  ResumeCustomers,
  ResumeDocuments,
  ResumeJobs,
  ResumeProjects,
  ResumeSkills,
  ResumeSkillTags,
]
export const COLLECTION_SLUGS = COLLECTIONS.map((c) => c.slug as CollectionSlug)
