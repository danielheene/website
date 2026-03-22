import { BlogCategories } from '@/collections/BlogCategories'
import { BlogPosts } from '@/collections/BlogPosts'
import { BlogTags } from '@/collections/BlogTags'
import { MediaAudios } from '@/collections/MediaAudios'
import { MediaDocuments } from '@/collections/MediaDocuments'
import { MediaImages } from '@/collections/MediaImages'
import { MediaVideos } from '@/collections/MediaVideos'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { ResumeSkills } from '@/collections/ResumeSkills'

export const COLLECTIONS = [BlogCategories, BlogPosts, MediaImages, MediaVideos, MediaDocuments, MediaAudios, Pages, Users, BlogTags, ResumeSkills]
export const COLLECTION_SLUGS = COLLECTIONS.map((c) => c.slug)
