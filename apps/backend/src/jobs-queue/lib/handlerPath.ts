import path from 'node:path'

/**
 * Where a job handler module lives, in Payload's `'<absolute path>#export'`
 * form. Payload loads string handlers at run time (through a dynamic import
 * hidden from bundlers), so their dependencies never enter the Next.js
 * bundle — only the process that runs jobs (`scripts/start-worker.mjs`, which
 * executes TypeScript through tsx) needs them.
 *
 * @param file handler file name inside `src/jobs-queue/handlers/`, extension included
 */
export const handlerPath = (file: string): string =>
  `${path.resolve(process.cwd(), 'src/jobs-queue/handlers', file)}#handler`
