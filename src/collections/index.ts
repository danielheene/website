import type { CollectionSlug } from 'payload'

import { BlogPosts } from '@/collections/BlogPosts'
import { BlogTags } from '@/collections/BlogTags'
import { MediaAudios } from '@/collections/MediaAudios'
import { MediaDocuments } from '@/collections/MediaDocuments'
import { MediaImages } from '@/collections/MediaImages'
import { MediaVideos } from '@/collections/MediaVideos'
import { Pages } from '@/collections/Pages'
import { ResumeJobs } from '@/collections/ResumeJobs'
import { ResumeSkills } from '@/collections/ResumeSkills'
import { Users } from '@/collections/Users'

export const COLLECTIONS = [
  BlogPosts,
  BlogTags,
  MediaImages,
  MediaVideos,
  MediaDocuments,
  MediaAudios,
  Pages,
  Users,
  ResumeSkills,
  ResumeJobs,
]
export const COLLECTION_SLUGS = COLLECTIONS.map((c) => c.slug as CollectionSlug)
