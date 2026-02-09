import { WidgetServerProps } from 'payload'

export const DummyWidget = async ({ req, widgetData, widgetSlug }: WidgetServerProps) => {
  return <div className="w-full aspect-3-2 bg-green">&nbsp;</div>
}
