import { TextField, TextFieldValidation } from 'payload'

/**
 * Document Key Field
 * The document key is used to identify a document without knowing its id and possible changes in filename.
 * @constructor
 */
export const DocumentKey = (): TextField => ({
  name: 'documentKey',
  type: 'text',
  index: true,
  unique: true,
  defaultValue: null,
  admin: {
    hidden: true,
    disableGroupBy: true,
    disableListColumn: true,
    disableListFilter: true,
  },
} as TextField)

export default DocumentKey
