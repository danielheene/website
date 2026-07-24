import type { Person, SoftwareSourceCode, WithContext } from 'schema-dts'

export interface SoftwareSourceCodeData {
  name: string
  description?: string
  url?: string
  codeRepository?: string
  programmingLanguage?: string
  codeSampleType?: 'code snippet' | 'full solution' | 'inline code' | 'scripts' | 'template'
  text?: string
  author?: {
    name: string
    url?: string
  }
  keywords?: string[]
  image?: string
}

/**
 * Generates SoftwareSourceCode JSON-LD
 *
 * @example
 * **For a Code Snippet:**
 * ```typescript
 * const snippetLd = generateSoftwareSourceCode({
 *   name: 'TypeScript Interface Example',
 *   programmingLanguage: 'TypeScript',
 *   codeSampleType: 'code snippet',
 *   text: 'interface User { name: string; }',
 *   author: { name: 'Daniel Heene' }
 * })
 * ```
 *
 * @example
 * **For a Repository:**
 * ```typescript
 * const repoLd = generateSoftwareSourceCode({
 *   name: 'Portfolio Website',
 *   description: 'Source code for my personal portfolio.',
 *   codeRepository: 'https://github.com/dheene/website',
 *   programmingLanguage: 'TypeScript',
 * })
 * ```
 */
export function generateSoftwareSourceCode(data: SoftwareSourceCodeData): WithContext<SoftwareSourceCode> {
  const author: Person | undefined = data.author
    ? {
        '@type': 'Person',
        name: data.author.name,
        ...(data.author.url && { url: data.author.url }),
      }
    : undefined

  const softwareSourceCode: WithContext<SoftwareSourceCode> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: data.name,
  }

  if (data.description) softwareSourceCode.description = data.description
  if (data.url) softwareSourceCode.url = data.url
  if (data.codeRepository) softwareSourceCode.codeRepository = data.codeRepository
  if (data.programmingLanguage) softwareSourceCode.programmingLanguage = data.programmingLanguage
  if (data.codeSampleType) softwareSourceCode.codeSampleType = data.codeSampleType
  if (data.text) softwareSourceCode.text = data.text
  if (author) softwareSourceCode.author = author

  if (data.keywords && data.keywords.length > 0) {
    softwareSourceCode.keywords = data.keywords.join(', ')
  }

  if (data.image) {
    softwareSourceCode.image = {
      '@type': 'ImageObject',
      url: data.image,
    }
  }

  return softwareSourceCode
}
