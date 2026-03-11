import type { Thing, WithContext } from 'schema-dts'

export interface JsonLdProps {
  data: WithContext<Thing> | WithContext<Thing>[]
}

/**
 * Component to render JSON-LD structured data
 * Can accept a single schema or an array of schemas
 *
 * Note: JSON.stringify() is safe here as it escapes HTML characters automatically,
 * and we control the data source (generated from our utility functions)
 */
export function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data]

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <stringified json>
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  )
}
