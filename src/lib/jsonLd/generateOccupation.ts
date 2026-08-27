import type { EmployeeRole, Occupation, Organization, WithContext } from 'schema-dts'

export interface OccupationData {
  name: string
  employer?: string
  startDate?: string
  endDate?: string
  responsibilities?: string[]
  skills?: string[]
}

/**
 * Generates `EmployeeRole` JSON-LD for a held position.
 *
 * schema.org models a *job someone held* as an `EmployeeRole` wrapping an
 * `Occupation`: the role carries the employer and the dates, while the
 * occupation carries what the work actually was. `Occupation` alone has no
 * `startDate`/`endDate`/employer, so a resume entry cannot be expressed with it.
 *
 * @example
 * ```typescript
 * const roleLd = generateOccupation({
 *   name: 'Senior Software Engineer',
 *   employer: 'ACME Inc.',
 *   startDate: '2020-01-01',
 *   endDate: '2022-01-01',
 *   responsibilities: ['Led the platform team'],
 *   skills: ['TypeScript', 'Next.js']
 * })
 * ```
 */
export function generateOccupation(data: OccupationData): WithContext<
  EmployeeRole<Occupation, 'roleName'>
> & {
  worksFor?: Organization
} {
  const occupation: Occupation = {
    '@type': 'Occupation',
    name: data.name,
  }

  if (Array.isArray(data.responsibilities) && data.responsibilities.length > 0) {
    occupation.responsibilities = data.responsibilities
  }

  if (Array.isArray(data.skills) && data.skills.length > 0) {
    occupation.skills = data.skills
  }

  const role: WithContext<EmployeeRole<Occupation, 'roleName'>> & {
    worksFor?: Organization
  } = {
    '@context': 'https://schema.org',
    '@type': 'EmployeeRole',
    roleName: occupation,
  }

  // `Role` carries no employer property of its own — schema.org expresses the
  // organization as the value the role wraps.
  if (data.employer) {
    role.worksFor = {
      '@type': 'Organization',
      name: data.employer,
    }
  }

  if (data.startDate) role.startDate = data.startDate
  if (data.endDate) role.endDate = data.endDate

  return role
}
