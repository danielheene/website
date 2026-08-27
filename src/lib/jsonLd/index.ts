// The Payload-free schema generators now live in @/lib and are re-exported
// here so app-side imports of '@/lib/jsonLd' keep working unchanged.
// `generatePersonSchema` and `generateWebSiteSchema` stay local: both read
// Payload-generated types.
export type { BlogData } from '@/lib/jsonLd/generateBlog'
export { generateBlog } from '@/lib/jsonLd/generateBlog'
export type { BlogPostingData } from '@/lib/jsonLd/generateBlogPosting'
export { generateBlogPosting } from '@/lib/jsonLd/generateBlogPosting'
export type { BreadcrumbItem } from '@/lib/jsonLd/generateBreadcrumbList'
export { generateBreadcrumbList } from '@/lib/jsonLd/generateBreadcrumbList'
export type { CollectionPageData } from '@/lib/jsonLd/generateCollectionPage'
export { generateCollectionPage } from '@/lib/jsonLd/generateCollectionPage'
export type { CreativeWorkData } from '@/lib/jsonLd/generateCreativeWork'
export { generateCreativeWork } from '@/lib/jsonLd/generateCreativeWork'
export type { OccupationData } from '@/lib/jsonLd/generateOccupation'
export { generateOccupation } from '@/lib/jsonLd/generateOccupation'
export type { OrganizationData } from '@/lib/jsonLd/generateOrganization'
export { generateOrganization } from '@/lib/jsonLd/generateOrganization'
export type { SoftwareSourceCodeData } from '@/lib/jsonLd/generateSoftwareSourceCode'
export { generateSoftwareSourceCode } from '@/lib/jsonLd/generateSoftwareSourceCode'
export { JsonLd } from '@/lib/jsonLd/JsonLd'

export { generatePersonSchema } from './generatePersonSchema'
export { generateWebSiteSchema } from './generateWebSiteSchema'
