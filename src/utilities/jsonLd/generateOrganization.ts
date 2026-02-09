import type { Organization, WithContext } from 'schema-dts'

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
export function generateOrganization(data: OrganizationData): WithContext<Organization> {
  const organization: WithContext<Organization> = {
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
