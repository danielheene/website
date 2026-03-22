import slugify from '@sindresorhus/slugify'

/**
 * Generates a slug from a string
 * @param input - The input string to generate the slug from
 */
export const generateSlug = (input: string): string => slugify(input, { decamelize: false })
