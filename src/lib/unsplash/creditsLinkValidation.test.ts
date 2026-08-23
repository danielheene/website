import type { Field, PayloadRequest } from 'payload'
import { sanitizeFields } from 'payload'
import { fieldSchemasToFormState } from '@payloadcms/ui/forms/fieldSchemasToFormState'

import { beforeAll, describe, expect, it } from 'vitest'

import { LinkField } from '@/fields/Link'

import { buildCreditsValue } from './buildCreditsValue'

/**
 * A validation-boundary test for the link nodes `buildCreditsValue` emits.
 *
 * This is deliberately not a shape-echoing unit test. `MediaImages.credits`
 * uses `RichTextField({ editorVariant: 'caption' })`, whose `LinkFeature` is
 * configured with an *array* of fields (`[...LinkField().fields]`). lexical's
 * `transformExtraFields` therefore **replaces** the default
 * `linkType`/`url`/`newTab` base fields with `LinkField()`'s own — which is
 * exactly the assumption a previous version of `buildCreditsValue` got wrong.
 *
 * What actually runs on `payload.create` is `linkValidation`
 * (`@payloadcms/richtext-lexical/dist/features/link/server/validate.js`): it
 * calls `fieldSchemasToFormState` with `data: node.fields` against the
 * sanitized link field schema and fails if any field state carries
 * `errorPaths`. This test reproduces that call exactly, against
 * `LinkField().fields` sanitized through Payload's own `sanitizeFields` — not
 * a hand-copied duplicate of the field list — so a change to `LinkField()`
 * (a new required field, a stricter validator) breaks this test rather than
 * production imports.
 *
 * Residual gap: the field array is sanitized against a stub config rather than
 * the app's real `payload.config.ts`, because importing that config pulls in
 * the Redis KV adapter and hard-fails without `REDIS_URL`. Only the
 * relationship-target check consults the config here, and the valid
 * relationships are passed explicitly. Making the app config importable
 * without a live Redis would let this assert against the true sanitized
 * `credits` field and close that gap entirely.
 */

/**
 * Runs the same `fieldSchemasToFormState` call `linkValidation` runs and
 * returns both the `errorPaths` it would collect and the resolved field
 * values.
 *
 * The resolved values matter as much as the errors here: they are what
 * confirms a passing link actually carries the real link text, not just that
 * validation didn't fail for some unrelated reason.
 */
const validateLinkFields = async (
  fields: Field[],
  data: Record<string, unknown>,
): Promise<{
  errorPaths: string[]
  values: Record<string, unknown>
}> => {
  const formState = await fieldSchemasToFormState({
    collectionSlug: 'media-images',
    data,
    documentData: {},
    fields,
    // `linkValidation` itself passes `undefined` here.
    fieldSchemaMap: undefined as never,
    initialBlockData: data,
    operation: 'create',
    permissions: {},
    preferences: undefined as never,
    renderAllFields: false,
    req: {
      payload: {
        config: {
          collections: [],
          globals: [],
        },
      },
      t: (key: string) => key,
      i18n: {
        t: (key: string) => key,
      },
      user: null,
    } as unknown as PayloadRequest,
    schemaPath: '',
  })

  const errorPaths = new Set<string>()
  const values: Record<string, unknown> = {}

  for (const key of Object.keys(formState)) {
    for (const path of formState[key]?.errorPaths ?? []) errorPaths.add(path)
    values[key] = formState[key]?.value
  }

  return {
    errorPaths: Array.from(errorPaths),
    values,
  }
}

describe('credits link nodes pass Payload link validation', () => {
  let linkFields: Field[]

  beforeAll(async () => {
    linkFields = await sanitizeFields({
      config: {
        collections: [],
        globals: [],
        localization: false,
      } as never,
      fields: LinkField().fields,
      parentIsLocalized: false,
      validRelationships: [
        'pages',
        'posts',
        'topics',
      ],
    })
  })

  it('sanitizes to the schema the caption editor actually validates against', () => {
    const names = linkFields.flatMap((field) =>
      'name' in field
        ? [
            field.name,
          ]
        : (
            (
              field as {
                fields?: Field[]
              }
            ).fields ?? []
          ).map((child) => ('name' in child ? child.name : '')),
    )

    // Guards the premise of this whole file: if `linkType` is missing here,
    // the base fields are not being replaced by LinkField()'s own — it would
    // mean lexical's default `internal`/`custom` field is still in play.
    expect(names).toContain('linkType')
    expect(names).toEqual(
      expect.arrayContaining([
        'linkType',
        'reference',
        'newTab',
        'url',
        'label',
      ]),
    )
  })

  it('reports no validation errors, and resolves to the intended link text', async () => {
    const value = buildCreditsValue({
      photographerName: 'Jane Doe',
      photographerProfileUrl: 'https://unsplash.com/@janedoe',
    })

    const links = (
      value.root.children[0] as unknown as {
        children: Array<{
          type: string
          fields?: Record<string, unknown>
        }>
      }
    ).children.filter((node) => node.type === 'link')

    expect(links).toHaveLength(2)

    const expected = [
      {
        label: 'Jane Doe',
        url: 'https://unsplash.com/@janedoe?utm_source=heene_io&utm_medium=referral',
      },
      {
        label: 'Unsplash',
        url: 'https://unsplash.com/?utm_source=heene_io&utm_medium=referral',
      },
    ]

    for (const [index, link] of links.entries()) {
      const { errorPaths, values } = await validateLinkFields(linkFields, link.fields ?? {})

      expect(errorPaths).toEqual([])
      // `label` must be the real link text, not the `{title}` default Payload
      // would otherwise substitute for a node that omitted it.
      expect(values.label).toBe(expected[index]?.label)
      expect(values.url).toBe(expected[index]?.url)
      expect(values.newTab).toBe(true)
    }
  })

  it('is a real validation boundary: a bad url and an empty label are rejected', async () => {
    // Negative control. Without this, the passing assertion above would be
    // indistinguishable from a harness that never surfaces errors at all.
    const { errorPaths } = await validateLinkFields(linkFields, {
      linkType: 'url',
      reference: null,
      url: 'not a url',
      newTab: true,
      label: '',
    })

    expect(errorPaths).toEqual(
      expect.arrayContaining([
        'url',
        'label',
      ]),
    )
  })

  it('a link node that omits label is now a validation error, not a silent default', async () => {
    // `label` lost its `{title}` default when LinkField was simplified — an
    // omitted label must now fail validation instead of silently resolving.
    const { errorPaths } = await validateLinkFields(linkFields, {
      linkType: 'url',
      url: 'https://unsplash.com/@janedoe',
      newTab: true,
    })

    expect(errorPaths).toContain('label')
  })
})
