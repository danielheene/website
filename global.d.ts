// No top-level import: it would turn this file into a module and the
// declarations below would stop being global.
namespace NodeJS {
  type SchemaEnv = import('@/types/environment').Env

  interface ProcessEnv extends SchemaEnv {}

  type ReadableStream = import('typescript').ReadableStream
}

declare module '@payloadcms/next/css'

declare module '*.css'

declare module '*.module.css' {
  const classes: {
    readonly [key: string]: string
  }

  export default classes
}
