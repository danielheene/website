// The Payload-free schema generators now live in @/lib and are re-exported
// here so app-side imports of '@website/lib/jsonLd' keep working unchanged.
// `generatePersonSchema` and `generateWebSiteSchema` stay local: both read
// Payload-generated types.
export type { BlogData } from './generateBlog'

export { generateBlog } from './generateBlog'

export type { BlogPostingData } from './generateBlogPosting'

export { generateBlogPosting } from './generateBlogPosting'

export type { BreadcrumbItem } from './generateBreadcrumbList'

export { generateBreadcrumbList } from './generateBreadcrumbList'

export type { CollectionPageData } from './generateCollectionPage'

export { generateCollectionPage } from './generateCollectionPage'

export type { CreativeWorkData } from './generateCreativeWork'

export { generateCreativeWork } from './generateCreativeWork'

export type { OccupationData } from './generateOccupation'

export { generateOccupation } from './generateOccupation'

export type { OrganizationData } from './generateOrganization'

export { generateOrganization } from './generateOrganization'

export type { SoftwareSourceCodeData } from './generateSoftwareSourceCode'

export { generateSoftwareSourceCode } from './generateSoftwareSourceCode'

export { JsonLd } from './JsonLd'

export { generatePersonSchema } from './generatePersonSchema'

export { generateWebSiteSchema } from './generateWebSiteSchema'
