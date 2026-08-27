import type { Thing, WithContext } from 'schema-dts'

export interface JsonLdProps {
  data: WithContext<Thing> | WithContext<Thing>[]
}

/**
 * Component to render JSON-LD structured data
 * Can accept a single schema or an array of schemas
 *
 * Note: JSON.stringify() does NOT escape HTML sequences like </script>.
 * We replace </ with <\/ so the HTML parser cannot prematurely close the
 * script tag. The result is still valid JSON — parsers treat <\/ identically.
 */
export function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data)
    ? data
    : [
        data,
      ]

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: </ is escaped as <\/ to prevent </script> injection>
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/<\//g, '<\\/'),
          }}
        />
      ))}
    </>
  )
}
