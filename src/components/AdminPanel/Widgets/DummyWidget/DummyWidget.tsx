import type { WidgetServerProps } from 'payload'

// biome-ignore lint/correctness/noUnusedFunctionParameters: test
export const DummyWidget = async ({ req, widgetData, widgetSlug }: WidgetServerProps) => {
  return <div className="w-full aspect-3-2 bg-green">&nbsp;</div>
}
