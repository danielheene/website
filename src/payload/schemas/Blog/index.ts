import { createSchemaGroup } from '@/payload/utilities/schemaHelpers'

import { Categories } from './Categories'
import { Tags } from './Tags'
import { Posts } from './Posts'

export const Blog = createSchemaGroup('blog', [Categories, Tags, Posts])
