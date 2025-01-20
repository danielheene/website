import { AboutMe } from './AboutMe'
import { Experience } from './Experience'
import { Projects } from './Projects'
import { Customers } from './Customers'
import { Hero } from './Hero'
import { Contact } from './Contact'
import { createSchemaGroup } from '@/payload/utilities/schemaHelpers'

export const Resume = createSchemaGroup('resume', [
  Hero,
  AboutMe,
  Experience,
  Projects,
  Customers,
  Contact,
])
