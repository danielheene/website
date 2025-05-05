import { CollectionConfig, GlobalConfig } from 'payload'
import { lowerCase, merge } from 'lodash-es'

export const createCollection = (
  config: CollectionConfig,
): CollectionConfig & {
  custom: CollectionConfig['custom'] & { type: 'collection' }
} => ({
  ...config,
  versions: merge(
    {
      drafts: true,
      maxPerDoc: 10,
    },
    config.versions || {},
  ) as CollectionConfig['versions'],
  custom: {
    ...config.custom,
    type: 'collection',
  },
})

export const resolveCollections = async (order?: string[]) => {
  const schemas = await import('./../schemas').then((m) =>
    Object.values(m).reduce((prev, curr) => [...prev, ...curr], []),
  )

  const collections = schemas
    .filter((schema) => schema?.custom?.type === 'collection' || 'labels' in schema)
    .sort((a, b) => {
      const aPos = order.indexOf(a.custom.group)
      const bPos = order.indexOf(b.custom.group)

      if (aPos === -1 && bPos === -1) return 0
      if (aPos === -1) return 1
      if (bPos === -1) return -1
      return aPos - bPos
    }) as CollectionConfig[]

  return collections
}

export const createGlobal = (
  config: GlobalConfig,
): GlobalConfig & {
  custom: GlobalConfig['custom'] & { type: 'global' }
} => ({
  ...config,
  versions: merge(
    {
      drafts: true,
      max: 10,
    },
    config.versions || {},
  ) as GlobalConfig['versions'],
  custom: {
    ...config.custom,
    type: 'global',
  },
})

export const resolveGlobals = async (order?: string[]) => {
  const schemas = await import('./../schemas').then((m) =>
    Object.values(m).reduce((prev, curr) => [...prev, ...curr], []),
  )

  const globals = schemas
    .filter((schema) => schema?.custom?.type === 'global')
    .sort((a, b) => {
      const aPos = order.indexOf(a.custom.group)
      const bPos = order.indexOf(b.custom.group)

      if (aPos === -1 && bPos === -1) return 0
      if (aPos === -1) return 1
      if (bPos === -1) return -1
      return aPos - bPos
    }) as GlobalConfig[]

  return globals
}

export const createSchemaGroup = (
  name: string,
  schemas: (CollectionConfig | GlobalConfig)[],
  forceGroupPrefixInSlug: boolean = true,
): (CollectionConfig | GlobalConfig)[] => {
  const schemaGroup = lowerCase(name)

  const dummys = [
    {
      type: 'collection',
      slug: `${schemaGroup}DummyCollection`,
      admin: { hidden: true },
      custom: { type: 'collection' },
      fields: [],
    } as CollectionConfig,
    {
      type: 'global',
      slug: `${schemaGroup}DummyGlobal`,
      admin: { hidden: true },
      custom: { type: 'global' },
      fields: [],
    } as GlobalConfig,
  ]

  return [...dummys, ...schemas].map((currentValue) => {
    if (forceGroupPrefixInSlug && !lowerCase(currentValue.slug).startsWith(schemaGroup)) {
      throw new Error(`Schema "${currentValue.slug}" does not start with "${schemaGroup}"`)
    }

    return {
      ...currentValue,
      admin: {
        ...currentValue.admin,
        group: schemaGroup,
      },
      custom: {
        ...currentValue.custom,
        group: schemaGroup,
      },
    }
  })
}
