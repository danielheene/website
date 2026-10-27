import type { UIField } from 'payload'

import type { SerpProgressBarConfig } from '@/fields/Meta/components/SerpProgressBar'

interface MetaSerpProgressFieldProps {
  /** The dot-path of the text field this bar observes, e.g. `'meta.title'`. */
  watchPath: string
  serpConfig: SerpProgressBarConfig
  /** Unique field name within the parent group — defaults to `'<watchPath>Progress'`. */
  name?: string
}

export const MetaSerpProgressField = ({
  watchPath,
  serpConfig,
  name,
}: MetaSerpProgressFieldProps): UIField => ({
  name: name ?? `${watchPath.split('.').pop()}Progress`,
  type: 'ui',
  admin: {
    disableListColumn: true,
    components: {
      Field: {
        path: '@/fields/Meta/MetaSerpProgressField/FieldComponent',
        serverProps: {
          watchPath,
          serpConfig,
        },
      },
    },
  },
})
