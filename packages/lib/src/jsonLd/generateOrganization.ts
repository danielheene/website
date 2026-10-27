import type { OrganizationLeaf, WithContext } from 'schema-dts'

export interface OrganizationData {
  name: string
  logo?: string
  url?: string
}

/**
 * Generates Organization JSON-LD
 *
 * @example
 * ```typescript
 * const organizationLd = generateOrganization({
 *   name: 'Company Name',
 *   logo: 'https://...',
 *   url: 'https://...'
 * })
 * ```
 */
export function generateOrganization(data: OrganizationData): WithContext<OrganizationLeaf> {
  const organization: WithContext<OrganizationLeaf> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
  }

  if (data.logo) {
    organization.logo = {
      '@type': 'ImageObject',
      url: data.logo,
    }
  }

  if (data.url) {
    organization.url = data.url
  }

  return organization
}
