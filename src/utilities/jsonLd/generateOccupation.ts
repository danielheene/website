import type { Occupation, WithContext } from 'schema-dts'

export interface OccupationData {
  name: string
  employer?: string
  startDate?: string
  endDate?: string
  responsibilities?: string[]
  skills?: string[]
  description?: string
}

/**
 * Generates Occupation JSON-LD
 *
 * @example
 * ```typescript
 * const occupationLd = generateOccupation({
 *   name: job.title,
 *   employer: job.employer,
 *   startDate: job.startDate,
 *   endDate: job.endDate,
 *   // Mapping the array of objects from Payload to a simple string array
 *   responsibilities: job.content?.map((c) => c.item),
 *   // Mapping technologies/tags
 *   skills: job.technologies,
 * })
 * ```
 */
export function generateOccupation(data: OccupationData): WithContext<Occupation> {
  const occupation: WithContext<Occupation> = {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: data.name,
  }

  if (data.description) {
    occupation.description = data.description
  }

  if (data.responsibilities && data.responsibilities.length > 0) {
    occupation.responsibilities = data.responsibilities
  }

  if (data.skills && data.skills.length > 0) {
    occupation.skills = data.skills
  }

  if (data.employer) {
    // @ts-expect-error - hiringOrganization is common in job-related schemas
    occupation.hiringOrganization = {
      '@type': 'Organization',
      name: data.employer,
    }
  }

  if (data.startDate) {
    // @ts-expect-error - dates are useful for resume data
    occupation.startDate = data.startDate
  }

  if (data.endDate) {
    // @ts-expect-error - dates are useful for resume data
    occupation.endDate = data.endDate
  }

  return occupation
}
