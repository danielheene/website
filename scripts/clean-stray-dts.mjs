#!/usr/bin/env node

/**
 * Removes declaration files that TypeScript 7 (`tsgo`, run by tsdown's dts
 * plugin) drops next to the sources of imported workspace packages.
 *
 * When a package's declaration program follows a `@website/*` import into a
 * sibling package's `src/`, tsgo emits an extra `.d.ts` beside each source
 * file it read. Those are neither wanted nor tracked — the real declarations
 * are the bundled ones in each package's `dist/`. Only declarations that sit
 * next to a real `.ts`/`.tsx` source of the same name are removed, so a
 * hand-written `.d.ts` is never touched.
 */
import { readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packagesDir = path.join(repoRoot, 'packages')

const exists = async (file) =>
  stat(file).then(
    () => true,
    () => false,
  )

/** @param {string} directory */
async function clean(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => [])

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        await clean(fullPath)

        return
      }

      if (!entry.name.endsWith('.d.ts')) return

      const base = fullPath.slice(0, -'.d.ts'.length)
      const hasSource = (await exists(`${base}.ts`)) || (await exists(`${base}.tsx`))

      if (hasSource) await rm(fullPath, { force: true })
    }),
  )
}

const packages = await readdir(packagesDir, { withFileTypes: true })

await Promise.all(
  packages
    .filter((entry) => entry.isDirectory())
    .map((entry) => clean(path.join(packagesDir, entry.name, 'src'))),
)
