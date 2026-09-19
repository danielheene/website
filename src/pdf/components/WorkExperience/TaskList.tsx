import { StyleSheet, View } from '@react-pdf/renderer'
import type {
  SerializedEditorState,
  SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'

import { BulletPoint } from '@/pdf/components/BulletPoint'
import { sizes } from '@/pdf/constants'
import { lexicalToJSX } from '@/pdf/lib/lexicalToJSX'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    rowGap: 7.5,
    width: sizes.columnRightWidth,
    marginLeft: sizes.columnLeftWidth,
  },
})

export const TaskList = ({
  tasks,
}: {
  tasks: {
    task: SerializedEditorState<SerializedLexicalNode>
  }[]
}) => (
  <View style={styles.container}>
    {tasks.map(({ task }, i) => (
      <BulletPoint key={i}>{lexicalToJSX(task)}</BulletPoint>
    ))}
  </View>
)
