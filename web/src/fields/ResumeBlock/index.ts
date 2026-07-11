import { Block, Field } from 'payload'
import { ResumeLayoutBlockProps } from '@/components/AdminPanel'
import { BlockGroup, BlockSlugValue } from '@/types/blocks'
import { RichTextField } from '@/fields/RichText'
import { upperFirst, startCase, kebabCase, camelCase } from 'lodash-es'


export const ResumeBlockField = <K extends string = Extract<BlockSlugValue, `Resume${string}`> & string>(props: {
  name: K
  variant: ResumeLayoutBlockProps['backgroundColor']
  label?: string | {
    singular: string
    plural: string
  }

  /**
   * Additional fields to be included in the block and accessble in the edit view.
   */
  additionalFields?: Field[]
  hiddenFields?: Field[]
}): Block => {
  const { name: nameFromProps, label: labelFromProps, variant, additionalFields = [], hiddenFields = [] } = props


  /**
   * Generates a PascalCase name and a KebapCase name from a given name.
   *
   * @param {string} name - The input name to be converted.
   * @returns {[string, string]} - A tuple containing the PascalCase name and the KebapCase name.
   */
  const [pascalCaseName, dashedName] = createNameVariations(nameFromProps)

  /**
   * Normalized label configuration containing both singular and plural forms.
   *
   * @type {{singular: string, plural: string}}
   */
  const labels = createLabelObject(labelFromProps, nameFromProps)

  /**
   * Object containing the file paths for block-related image assets.
   *
   * @type {Object}
   * @property {string} thumbnail - The URL path to the thumbnail SVG image for the block, constructed using the dashed name
   * @property {string} icon - The URL path to the icon SVG image for the block, constructed using the dashed name
   */
  const images = {
    thumbnail: `/payload/blocks/${dashedName}-thumbnail.svg`,
    icon: `/payload/blocks/${dashedName}-icon.svg`,
  }

  /**
   * Configuration object for dynamically loading and rendering a field component.
   * Defines the component's import path and the properties to be passed to it on the client side.
   *
   * @typedef {Object} ComponentConf
   * @property {string} path - The module path to the field component, using webpack alias notation
   * @property {Object} clientProps - Properties object that will be passed to the component when rendered on the client
   * @property {string} clientProps.variant - The visual variant or style configuration for the component
   * @property {string} clientProps.imageSrc - The source URL or path for the thumbnail image to be displayed
   */
  const ComponentConf = {
    path: '@/fields/ResumeBlock/components/FieldComponent',
    clientProps: {
      variant,
      imageSrc: images.thumbnail,
    },
  }


  return {
    slug: pascalCaseName,
    labels,
    interfaceName: pascalCaseName,
    admin: {
      group: BlockGroup['Resume'],
      disableBlockName: true,
      components: {
        Block: ComponentConf,
      },
      images,
    },
    fields: [
      {
        type: 'group',
        admin: {
          components: {
            Field: ComponentConf,
          },
        },
        fields: [
          RichTextField({
            name: 'caption',
            editorVariant: 'inline',
            overrides: {
              label: false,
              admin: {
                components: {
                  Label: null,
                  Description: null,
                },
              },
            },
          }),
          ...additionalFields,
        ],
      },
      ...hiddenFields,
    ],
  }
}


const createNameVariations = (name: string): [string, string] => {
  const dashedName = [kebabCase(name.replaceAll(/(Block|-block)*$/g, '')), 'block'].join('-')
  const pascalCaseName = upperFirst(camelCase(dashedName)) as string
  return [pascalCaseName, dashedName]
}


const createLabelObject = (label: string | { singular: string, plural: string } | undefined, fallBack?: string): {
  singular: string,
  plural: string
} => {
  const isComplexLabel = typeof label === 'object' && 'singular' in label && typeof label.singular === 'string' && label.singular !== '' && 'plural' in label && typeof label.plural === 'string' && label.plural !== ''
  const isSimpleLabel = !isComplexLabel && typeof label === 'string' && label !== ''
  const isMissingLabel = !isComplexLabel && !isSimpleLabel && typeof label === 'undefined'
  const hasFallBack = typeof fallBack === 'string' && fallBack !== ''

  return isComplexLabel ? { ...label } : isSimpleLabel ? {
    singular: label,
    plural: label,
  } : isMissingLabel && hasFallBack ? {
    singular: startCase(fallBack).replaceAll(/(Block|-block)*$/g, '').trim(),
    plural: startCase(fallBack).replaceAll(/(Block|-block)*$/g, '').trim(),
  } : null
}
