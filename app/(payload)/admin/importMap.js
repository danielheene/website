import {
  MetaDescriptionComponent as MetaDescriptionComponent_21,
  MetaImageComponent as MetaImageComponent_20,
  MetaTitleComponent as MetaTitleComponent_19,
  OverviewComponent as OverviewComponent_18,
  PreviewComponent as PreviewComponent_22,
} from '@payloadcms/plugin-seo/client'
import {
  BlockquoteFeatureClient as BlockquoteFeatureClient_5,
  BoldFeatureClient as BoldFeatureClient_13,
  ChecklistFeatureClient as ChecklistFeatureClient_6,
  FixedToolbarFeatureClient as FixedToolbarFeatureClient_12,
  HeadingFeatureClient as HeadingFeatureClient_10,
  HorizontalRuleFeatureClient as HorizontalRuleFeatureClient_4,
  IndentFeatureClient as IndentFeatureClient_9,
  InlineCodeFeatureClient as InlineCodeFeatureClient_3,
  InlineToolbarFeatureClient as InlineToolbarFeatureClient_11,
  ItalicFeatureClient as ItalicFeatureClient_14,
  LinkFeatureClient as LinkFeatureClient_17,
  OrderedListFeatureClient as OrderedListFeatureClient_7,
  ParagraphFeatureClient as ParagraphFeatureClient_16,
  RichTextCell as RichTextCell_0,
  RichTextField as RichTextField_1,
  UnderlineFeatureClient as UnderlineFeatureClient_15,
  UnorderedListFeatureClient as UnorderedListFeatureClient_8,
} from '@payloadcms/richtext-lexical/client'
import { getGenerateComponentMap as getGenerateComponentMap_2 } from '@payloadcms/richtext-lexical/generateComponentMap'
import { default as default_25 } from 'src/payload/components/CustomerLogoField'
import { default as default_26 } from 'src/payload/components/CustomersRowLabel'
import { default as default_24 } from 'src/payload/components/ExperienceRowLabel'
import { default as default_27 } from 'src/payload/components/Icon'
import { default as default_28 } from 'src/payload/components/Logo'
import { default as default_23 } from 'src/payload/components/TagInputField'

export const importMap = {
  '@payloadcms/richtext-lexical/client#RichTextCell': RichTextCell_0,
  '@payloadcms/richtext-lexical/client#RichTextField': RichTextField_1,
  '@payloadcms/richtext-lexical/generateComponentMap#getGenerateComponentMap':
    getGenerateComponentMap_2,
  '@payloadcms/richtext-lexical/client#InlineCodeFeatureClient': InlineCodeFeatureClient_3,
  '@payloadcms/richtext-lexical/client#HorizontalRuleFeatureClient': HorizontalRuleFeatureClient_4,
  '@payloadcms/richtext-lexical/client#BlockquoteFeatureClient': BlockquoteFeatureClient_5,
  '@payloadcms/richtext-lexical/client#ChecklistFeatureClient': ChecklistFeatureClient_6,
  '@payloadcms/richtext-lexical/client#OrderedListFeatureClient': OrderedListFeatureClient_7,
  '@payloadcms/richtext-lexical/client#UnorderedListFeatureClient': UnorderedListFeatureClient_8,
  '@payloadcms/richtext-lexical/client#IndentFeatureClient': IndentFeatureClient_9,
  '@payloadcms/richtext-lexical/client#HeadingFeatureClient': HeadingFeatureClient_10,
  '@payloadcms/richtext-lexical/client#InlineToolbarFeatureClient': InlineToolbarFeatureClient_11,
  '@payloadcms/richtext-lexical/client#FixedToolbarFeatureClient': FixedToolbarFeatureClient_12,
  '@payloadcms/richtext-lexical/client#BoldFeatureClient': BoldFeatureClient_13,
  '@payloadcms/richtext-lexical/client#ItalicFeatureClient': ItalicFeatureClient_14,
  '@payloadcms/richtext-lexical/client#UnderlineFeatureClient': UnderlineFeatureClient_15,
  '@payloadcms/richtext-lexical/client#ParagraphFeatureClient': ParagraphFeatureClient_16,
  '@payloadcms/richtext-lexical/client#LinkFeatureClient': LinkFeatureClient_17,
  '@payloadcms/plugin-seo/client#OverviewComponent': OverviewComponent_18,
  '@payloadcms/plugin-seo/client#MetaTitleComponent': MetaTitleComponent_19,
  '@payloadcms/plugin-seo/client#MetaImageComponent': MetaImageComponent_20,
  '@payloadcms/plugin-seo/client#MetaDescriptionComponent': MetaDescriptionComponent_21,
  '@payloadcms/plugin-seo/client#PreviewComponent': PreviewComponent_22,
  '/payload/components/TagInputField#default': default_23,
  '/payload/components/ExperienceRowLabel#default': default_24,
  '/payload/components/CustomerLogoField#default': default_25,
  '/payload/components/CustomersRowLabel#default': default_26,
  '/payload/components/Icon#default': default_27,
  '/payload/components/Logo#default': default_28,
}
