import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { Field, RichTextField, Tab } from 'payload'

export const SLUG = {
  HERO: 'resumeHero',
  ABOUT_ME: 'resumeAboutMe',
  CUSTOMERS: 'resumeCustomers',
  EXPERIENCE: 'resumeExperience',
  PROJECTS: 'resumeProjects',
  CONTACT: 'resumeContact',
}

export const TitleField: Field = {
  name: 'title',
  type: 'text',
  label: false,
  admin: {
    placeholder: 'Title',
  },
}

export const CaptionField: RichTextField = {
  name: 'caption',
  type: 'richText',
  label: false,
  editor: lexicalEditor({
    features: [
      ItalicFeature(),
      BoldFeature(),
      UnderlineFeature(),
      OrderedListFeature(),
      UnorderedListFeature(),
      ParagraphFeature(),
      BlockquoteFeature(),
      LinkFeature(),
      HorizontalRuleFeature(),
      IndentFeature(),
      InlineCodeFeature(),
      FixedToolbarFeature({ disableIfParentHasFixedToolbar: true }),
    ],
  }),
}

export const IntroTab: Tab = {
  label: 'Intro',
  fields: [TitleField, CaptionField],
}
