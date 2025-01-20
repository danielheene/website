import { Media } from './Media'
import { Pages } from './Pages'
import { Users } from './Users'
import { createSchemaGroup } from '@/payload/utilities/schemaHelpers'

export const General = createSchemaGroup('general', [Media, Pages, Users], false)
