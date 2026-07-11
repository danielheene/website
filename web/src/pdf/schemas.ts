import z from 'zod'

import { DocumentSectionType } from '@pdf/types'

export const documentHeaderSchema = z.strictObject({
  portraitUrl: z.url(),
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),
  telephone: z.object({
    label: z.string(),
    href: z.templateLiteral([
      'tel:',
      z.e164(),
    ]),
  }),
  email: z.object({
    label: z.email(),
    href: z.templateLiteral([
      'mailto:',
      z.email(),
    ]),
  }),
  website: z.object({
    label: z.hostname().regex(z.regexes.domain),
    href: z.url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
    }),
  }),
  github: z.object({
    label: z.string(),
    href: z.url({
      protocol: /^https?$/,
      hostname: /^github\.com$/,
    }),
  }),
})

export const documentFooterSchema = z.strictObject({
  generatedNotice: z.string(),
  generatedNoticeUrl: z.url(),
  renderPagination: z.function({
    input: z.tuple([
      z.string(),
      z.string(),
    ]),
    output: z.string(),
  }),
})

export const introductionSectionSchema = z.strictObject({
  type: z.literal(DocumentSectionType.Introduction),
  data: z.object({
    headline: z.string(),
    content: z.string(),
  }),
})

export const languageSectionSchema = z.strictObject({
  type: z.literal(DocumentSectionType.Language),
  data: z.strictObject({
    headline: z.string(),
    entries: z.array(z.string()),
  }),
})

export const skillSectionSchema = z.strictObject({
  type: z.literal(DocumentSectionType.Skill),
  data: z.object({
    headline: z.string(),
    entries: z.array(
      z.object({
        name: z.string(),
        caption: z.string().optional(),
      }),
    ),
  }),
})

export const workExperienceSectionSchema = z.strictObject({
  type: z.literal(DocumentSectionType.WorkExperience),
  data: z.object({
    headline: z.string(),
    entries: z.array(
      z.object({
        title: z.string(),
        interval: z.string(),
        tasks: z.nullable(z.array(z.string())),
      }),
    ),
  }),
})

export const documentSectionSchema = z.union([
  introductionSectionSchema,
  workExperienceSectionSchema,
  skillSectionSchema,
  languageSectionSchema,
])

export const documentSchema = z.strictObject({
  isPreview: z.boolean().default(false),
  locale: z
    .literal([
      'en',
      'de',
    ])
    .default('en'),
  document: z.strictObject({
    author: z.string(),
    title: z.string(),
    creationDate: z.date(),
    language: z.literal([
      'en_EN',
      'de_DE',
    ]),
  }),
  header: documentHeaderSchema,
  footer: documentFooterSchema,
  sections: z.array(documentSectionSchema),
})
