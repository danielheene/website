import { BlogCategories } from '@/collections/BlogCategories'
import { BlogPosts } from '@/collections/BlogPosts'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { BlogTags } from '@/collections/BlogTags'

export const COLLECTIONS = [BlogCategories, BlogPosts, Media, Pages, Users, BlogTags]
export const COLLECTION_SLUGS = COLLECTIONS.map((c) => c.slug)
