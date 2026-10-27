import type { CollectionConfig, Field } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { COLLECTIONS } from '@/collections'
import { Redirects } from '@/collections/Redirects'
import { References } from '@/collections/References'

// Schema configs import fetchers that import the Payload config, which in turn
// imports these schemas; the config itself is not needed to inspect columns.
vi.mock('@payload-config', () => ({
  default: {},
}))

const schemas: CollectionConfig[] = [...COLLECTIONS, Redirects, References]

/**
 * The accessors Payload's list view can actually render for a collection.
 *
 * `buildColumnState` iterates the collection's *fields* and looks each one up
 * in the configured column list, so a `defaultColumns` entry that matches no
 * field never becomes a column — it is dropped without warning.
 *
 * The field set therefore has to include everything Payload injects itself:
 * `id`, the timestamp fields, `_status` (from `versions.drafts`) and the
 * upload base fields. It also has to exclude the fields Payload refuses to
 * render as a column — `admin.disableListColumn` and `admin.disabled` both
 * take a field out of the list.
 */
const renderableAccessors = (config: CollectionConfig): Set<string> => {
  const names = new Set<string>(['id'])
  const excluded = new Set<string>()

  const isListColumnCandidate = (field: Field): boolean => {
    if (field.admin?.disableListColumn === true) {
      return false
    }

    if (field.admin?.disabled === true) {
      return false
    }

    return true
  }

  const visit = (fields: Field[]): void => {
    for (const field of fields) {
      if ('name' in field && typeof field.name === 'string') {
        if (isListColumnCandidate(field)) {
          names.add(field.name)
        } else {
          excluded.add(field.name)
        }
      }

      if ('fields' in field && Array.isArray(field.fields)) {
        visit(field.fields)
      }

      if (field.type === 'tabs' && 'tabs' in field) {
        for (const tab of field.tabs) {
          visit(tab.fields)
        }
      }
    }
  }

  visit(config.fields ?? [])

  if (typeof config.versions === 'object' && config.versions?.drafts) {
    names.add('_status')
  }

  if (config.timestamps !== false) {
    names.add('createdAt')
    names.add('updatedAt')
  }

  if (config.upload) {
    /**
     * Payload merges its upload base fields into the collection's own fields
     * with `mergeBaseFields`, which deep-merges the collection's field over
     * the base one. A collection that overrides `mimeType` with
     * `disableListColumn: true` therefore keeps that flag and cannot render
     * a `mimeType` column — the override has to be respected here too.
     */
    const uploadBaseFields = [
      'filename',
      'mimeType',
      'filesize',
      'width',
      'height',
      'thumbnailURL',
      'url',
      'sizes',
    ]

    for (const name of uploadBaseFields) {
      if (excluded.has(name)) {
        continue
      }

      names.add(name)
    }
  }

  return names
}

/**
 * `admin.defaultColumns` drives the list view's initial columns. An accessor
 * that matches no field is silently dropped by Payload's `getColumns`, so the
 * column never renders and the list silently loses the column it was
 * configured with.
 *
 * The draft state lives in `_status`, not `status` — a `status` entry looks
 * plausible but matches nothing.
 */
describe('defaultColumns reference real fields', () => {
  it.each(schemas)('$slug defaultColumns all resolve to a field', (config) => {
    const accessors = renderableAccessors(config)

    for (const column of config.admin?.defaultColumns ?? []) {
      expect(
        accessors.has(column),
        `"${config.slug}" lists a default column "${column}" that matches no field — Payload drops it silently`,
      ).toBe(true)
    }
  })
})

/**
 * `defaultSort` is passed straight to the database adapter, which resolves it
 * against the collection's fields. A path that matches no field sorts by a
 * missing property, so every document ties and the order falls back to the
 * adapter's tiebreaker instead of the configured one.
 */
describe('defaultSort references real fields', () => {
  it.each(schemas)('$slug defaultSort all resolve to a field', (config) => {
    const accessors = renderableAccessors(config)
    const sort = config.defaultSort

    const sortPaths = Array.isArray(sort) ? sort : sort ? [sort] : []

    for (const path of sortPaths) {
      const withoutDirection = path.replace(/^-/, '').replace(/__/g, '.')
      expect(
        accessors.has(withoutDirection),
        `"${config.slug}" sorts by "${path}", which matches no field — the sort is ignored by the database`,
      ).toBe(true)
    }
  })
})
