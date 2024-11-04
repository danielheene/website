import { SlugUniqueOptions } from '@sanity/types/src/slug/types';
import { defineField } from 'sanity';
import slugify from 'slugify';

export const FieldConfig = {
  SlugInput: {
    title: 'Slug',
    name: 'slug',
    type: 'slug',
    initialValue: {
      current: '',
    },
    options: {
      source: (doc) => doc.title as string,
      slugify: (input) =>
        slugify(input, { locale: 'de', lower: true, strict: true, trim: true }),
      isUnique: isUniqueAcrossAllDocuments,
    },
  },
  Title: {
    title: 'Title',
    name: 'title',
    type: 'string',
    initialValue: '',
  },
  MetaDescription: {
    title: 'Description',
    name: 'metaDescription',
    type: 'text',
    rows: 5,
    initialValue: '',
  },
  MetaKeywords: {
    title: 'Keywords',
    name: 'metaKeywords',
    type: 'array',
    of: [{ type: 'string' }],
    initialValue: [],
    options: {
      layout: 'tags',
    },
  },
  MetaTags: {
    title: 'Meta Tags',
    name: 'metaTags',
    type: 'array',
    of: [{ name: 'metaTag', type: 'settings.metaTag' }],
    initialValue: [],
  },
};

export const MetaObject = {
  Default: defineField({
    title: 'Meta',
    name: 'meta',
    type: 'object',
    fields: [
      FieldConfig.MetaDescription,
      FieldConfig.MetaKeywords,
      FieldConfig.MetaTags,
    ],
  }),
};

export const COL_FIELDSET_NAME = {
  'FULL': 'FULL',
  '1-11': '1-11',
  '2-10': '2-10',
  '3-9': '3-9',
  '4-8': '4-8',
  '5-7': '5-7',
  '6-6': '6-6',
  '7-5': '7-5',
  '8-4': '8-4',
  '9-3': '9-3',
  '10-2': '10-2',
  '11-1': '11-1',
};

export const COL_FIELDSETS = [
  {
    name: COL_FIELDSET_NAME['1-11'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['2-10'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['3-9'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['4-8'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['5-7'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['6-6'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['7-5'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['8-4'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['9-3'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['10-2'],
    options: { columns: 2 },
  },
  {
    name: COL_FIELDSET_NAME['11-1'],
    options: { columns: 2 },
  },
];

// Note: this assumes that every document that has a slug field
// have it on the `slug` field at the root
export async function isUniqueAcrossAllDocuments(
  slug: string,
  options: SlugUniqueOptions
) {
  // @ts-ignore
  const { document, getClient, path } = options;
  const slugPath = `${path.join('.')}.current`;

  const query = `!defined(*[!(_id in [$draft, $published]) && ${slugPath} == $slug][0]._id)`;
  const client = getClient({ apiVersion: '2021-06-07' });
  const id = document._id.replace(/^drafts\./, '');
  const params = {
    draft: `drafts.${id}`,
    published: id,
    slug,
  };

  return await client.fetch(query, params);
}
