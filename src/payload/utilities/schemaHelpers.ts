import { CollectionConfig, GlobalConfig } from 'payload'
import { lowerCase } from 'lodash-es'

export const createCollection = (
  config: CollectionConfig,
): CollectionConfig & {
  custom: CollectionConfig['custom'] & { type: 'collection' }
} => ({
  ...config,
  custom: {
    ...config.custom,
    type: 'collection',
  },
})

export const filterCollections = (...schemas: (CollectionConfig | GlobalConfig)[]) => {
  return schemas.filter(
    (schema) => schema?.custom?.type === 'collection' || 'labels' in schema,
  ) as CollectionConfig[]
}

export const createGlobal = (
  config: GlobalConfig,
): GlobalConfig & {
  custom: GlobalConfig['custom'] & { type: 'global' }
} => ({
  ...config,
  custom: {
    ...config.custom,
    type: 'global',
  },
  versions: {
    drafts: true,
    max: 10,
  },
})

export const filterGlobals = (...schemas: (CollectionConfig | GlobalConfig)[]) => {
  return schemas.filter(
    (schema) => schema?.custom?.type === 'global' || 'label' in schema,
  ) as GlobalConfig[]
}

export const createSchemaGroup = (
  name: string,
  schemas: (CollectionConfig | GlobalConfig)[],
  forceGroupPrefixInSlug: boolean = true,
): (CollectionConfig | GlobalConfig)[] => {
  return schemas.map((currentValue) => {
    const schemaGroup = lowerCase(name)

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
