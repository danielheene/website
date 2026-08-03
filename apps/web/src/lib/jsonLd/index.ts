// The Payload-free schema generators now live in @repo/utils and are re-exported
// here so app-side imports of '@/lib/jsonLd' keep working unchanged.
// `generatePersonSchema` and `generateWebSiteSchema` stay local: both read
// Payload-generated types.
export type { BlogData } from '@repo/utils/jsonLd/generateBlog'
export { generateBlog } from '@repo/utils/jsonLd/generateBlog'
export type { BlogPostingData } from '@repo/utils/jsonLd/generateBlogPosting'
export { generateBlogPosting } from '@repo/utils/jsonLd/generateBlogPosting'
export type { BreadcrumbItem } from '@repo/utils/jsonLd/generateBreadcrumbList'
export { generateBreadcrumbList } from '@repo/utils/jsonLd/generateBreadcrumbList'
export type { CollectionPageData } from '@repo/utils/jsonLd/generateCollectionPage'
export { generateCollectionPage } from '@repo/utils/jsonLd/generateCollectionPage'
export type { CreativeWorkData } from '@repo/utils/jsonLd/generateCreativeWork'
export { generateCreativeWork } from '@repo/utils/jsonLd/generateCreativeWork'
export type { OccupationData } from '@repo/utils/jsonLd/generateOccupation'
export { generateOccupation } from '@repo/utils/jsonLd/generateOccupation'
export type { OrganizationData } from '@repo/utils/jsonLd/generateOrganization'
export { generateOrganization } from '@repo/utils/jsonLd/generateOrganization'
export { generatePersonSchema } from './generatePersonSchema'
export type { SoftwareSourceCodeData } from '@repo/utils/jsonLd/generateSoftwareSourceCode'
export { generateSoftwareSourceCode } from '@repo/utils/jsonLd/generateSoftwareSourceCode'
export { generateWebSiteSchema } from './generateWebSiteSchema'
export { JsonLd } from '@repo/utils/jsonLd/JsonLd'
