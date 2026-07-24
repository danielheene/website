import { StyleSheet, View } from '@react-pdf/renderer'

import { BulletPoint } from '@/pdf/components/BulletPoint'
import { sizes } from '@/pdf/constants'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    rowGap: 7.5,
    width: sizes.columnRightWidth,
    marginLeft: sizes.columnLeftWidth,
  },
})

export const TaskList = ({ tasks }: { tasks: string[] }) => (
  <View style={styles.container}>
    {tasks.map((task, i) => (
      <BulletPoint key={i}>{task}</BulletPoint>
    ))}
  </View>
)
