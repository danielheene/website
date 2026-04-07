import { CollectionConfig } from 'payload'
import { CollectionSlug, AdminGroup } from '@custom-types'
import { SlugField } from '@/fields/Slug'


export const ResumeSkills: CollectionConfig<CollectionSlug.ResumeSkills> = {
  slug: CollectionSlug.ResumeSkills,
  labels: {
    singular: 'Skill',
    plural: 'Skills',
  },
  admin: {
    useAsTitle: 'name',
    group: AdminGroup.Resume,
    defaultColumns: ['name', 'slug', 'type'],
    disableCopyToLocale: true,
    components: {
      edit: {
        beforeDocumentControls: ['@/components/AdminPanel#LanguageToggle'],
      },
    },
  },
  defaultSort: ['type', 'name'],
  defaultPopulate: {
    name: true,
    slug: true,
    type: true,
  },
  disableDuplicate: true,
  forceSelect: {
    name: true,
    slug: true,
    type: true,
  },
  indexes: [{
    unique: true,
    fields: ['slug', 'type'],
  }],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      hooks: {
        // beforeChange: [
        //   async ({ operation, req, data, path, collection, originalDoc }) => {
        //     const existingDoc = await req.payload.db.findOne({
        //       collection: collection.slug,
        //       where: {
        //         _id: { equals: originalDoc._id },
        //       },
        //       locale: 'all',
        //     })
        //     console.log('existingDoc:', existingDoc)
        //     console.log('operation:', operation)
        //     console.log('data:', data)
        //     if (operation === 'create' && req.file) {
        //       console.log('File uploaded successfully:', req.file.name)
        //     }
        //   },
        // ],
      },
    },
    SlugField({ fieldToUse: 'name' }),
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Technology', value: 'technology' },
        { label: 'Programming Language', value: 'programmingLanguage' },
        { label: 'Methodology', value: 'methodology' },
        { label: 'Language', value: 'language' },
        { label: 'Private Interest', value: 'privateInterest' },
      ],
      defaultValue: 'technology',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: false,
  trash: false,
}
