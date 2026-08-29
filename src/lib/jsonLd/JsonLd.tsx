import type { Thing, WithContext } from 'schema-dts'

export interface JsonLdProps {
  data: WithContext<Thing> | WithContext<Thing>[]
}

/**
 * Serializes JSON for safe embedding inside an inline <script> tag.
 * Escapes HTML-significant characters and JS line-separator code points.
 */
const toSafeJsonLd = (value: WithContext<Thing>): string =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

/**
 * Component to render JSON-LD structured data
 * Can accept a single schema or an array of schemas
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
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized with script-safe escaping.
          dangerouslySetInnerHTML={{
            __html: toSafeJsonLd(schema),
          }}
        />
      ))}
    </>
  )
}
