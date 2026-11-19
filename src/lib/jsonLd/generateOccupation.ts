import type { Occupation, Role } from 'schema-dts'

export interface OccupationData {
  name: string
  employer?: string
  startDate?: string | null
  endDate?: string | null
  responsibilities?: string[]
  skills?: string[]
}

/**
 * A job the person held, for `Person.hasOccupation`. schema.org dates a
 * property's value through the Role pattern: the role repeats the property it
 * wraps (`hasOccupation`) and carries the dates. `Occupation` has no employer
 * property, so the employer goes into its description.
 */
export function generateOccupation(data: OccupationData): Role<Occupation, 'hasOccupation'> {
  const occupation: Occupation = {
    '@type': 'Occupation',
    name: data.name,
    ...(data.employer && {
      description: `${data.name}, ${data.employer}`,
    }),
    ...(data.responsibilities &&
      data.responsibilities.length > 0 && {
        responsibilities: data.responsibilities,
      }),
    ...(data.skills &&
      data.skills.length > 0 && {
        skills: data.skills,
      }),
  }

  return {
    '@type': 'Role',
    hasOccupation: occupation,
    ...(data.startDate && {
      startDate: data.startDate.slice(0, 10),
    }),
    ...(data.endDate && {
      endDate: data.endDate.slice(0, 10),
    }),
  }
}
