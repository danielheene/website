import type { CollectionConfig, Config, Plugin } from 'payload'

import {
  DOCUMENT_TASKS,
  type DocumentTask,
  documentTaskAppliesTo,
} from '@/lib/documentTasks/definitions'
import { isReferenceTracked } from '@/plugins/references/excludedCollections'

const MENU_PATH = '@/components/AdminPanel/DocumentTasksMenu#DocumentTasksMenu'

const withTaskMenus = (collection: CollectionConfig, tasks: DocumentTask[]): CollectionConfig => {
  const components = collection.admin?.components

  return {
    ...collection,
    admin: {
      ...collection.admin,
      components: {
        ...components,
        listMenuItems: [
          ...(components?.listMenuItems ?? []),
          {
            path: MENU_PATH,
            clientProps: {
              collection: collection.slug,
              tasks,
              scope: 'collection',
            },
          },
        ],
        edit: {
          ...components?.edit,
          editMenuItems: [
            ...(components?.edit?.editMenuItems ?? []),
            {
              path: MENU_PATH,
              clientProps: {
                collection: collection.slug,
                tasks,
                scope: 'document',
              },
            },
          ],
        },
      },
    },
  }
}

/**
 * Adds the document tasks (`src/lib/documentTasks/`) that apply to a collection to its list
 * menu (runs them for every document) and its edit menu (for the open document).
 */
export const documentTasksPlugin =
  (): Plugin =>
  (incomingConfig: Config): Config => ({
    ...incomingConfig,
    collections: (incomingConfig.collections ?? []).map((collection) => {
      const tasks = DOCUMENT_TASKS.filter((task) =>
        documentTaskAppliesTo(task, collection.slug, isReferenceTracked),
      )

      return tasks.length > 0 ? withTaskMenus(collection, tasks) : collection
    }),
  })
