/**
 *    Bundle-size budget for the public site.
 *
 *    Reads a finished `next build --webpack` output (`.next`) and reports, per
 *    page route, the gzipped JavaScript a first visit can download: the chunks
 *    every route shares plus the chunks of the client components that route's
 *    layouts and page import. It is an upper bound, since a component a page
 *    imports but does not render is never fetched. Fails when a budgeted route
 *    is over its limit.
 *
 *    Next 16 no longer prints route sizes after a build, so this replaces the
 *    "First Load JS" column.
 *
 *    Usage:
 *      node scripts/check-bundle-size.mjs            # check, exit 1 when over budget
 *      node scripts/check-bundle-size.mjs --json     # machine-readable report
 */
import { existsSync, readdirSync, readFileSync, statSync, appendFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import vm from 'node:vm'
import { gzipSync } from 'node:zlib'

const KB = 1024

/**
 *    Limits in gzipped kB of first-load JavaScript.
 *
 *    `targetKb` is the recommended size: 170 kB is the long-standing budget for
 *    critical-path JavaScript on a mid-range phone over a slow connection, and
 *    the size above which Next's own build output used to mark a route red.
 *    Missing it is reported as a warning, not a failure: React and the Next
 *    runtime alone are about 190 kB here, so no route can meet it today.
 *
 *    `maxKb` is the enforced limit. It sits a little above the largest route at
 *    the time it was set (251 kB), so it catches a regression rather than
 *    describing a goal. Lower it whenever the routes get smaller; raising it
 *    should come with a reason in the commit.
 *
 *    The Payload admin panel is not budgeted: its bundle is Payload's, and it
 *    is a signed-in tool rather than a page a visitor waits for.
 */
const BUDGETS = [
  {
    name: 'Public pages',
    match: (route) => !route.startsWith('/admin'),
    targetKb: 170,
    maxKb: 265,
  },
]

const distDir = path.resolve(
  process.argv.find((arg) => arg.startsWith('--dir='))?.slice(6) ?? '.next',
)

const asJson = process.argv.includes('--json')

if (!existsSync(path.join(distDir, 'build-manifest.json'))) {
  console.error(`No build found in ${distDir}. Run \`bun run build\` first.`)
  process.exit(2)
}

const gzipSizes = new Map()

const gzipSize = (file) => {
  if (!gzipSizes.has(file)) {
    // Manifests hold URL paths: `[slug]` appears as `%5Bslug%5D`.
    const onDisk = path.join(distDir, decodeURIComponent(file))

    gzipSizes.set(file, gzipSync(readFileSync(onDisk)).length)
  }

  return gzipSizes.get(file)
}

const { rootMainFiles } = JSON.parse(
  readFileSync(path.join(distDir, 'build-manifest.json'), 'utf8'),
)

const sharedFiles = rootMainFiles.filter((file) => file.endsWith('.js'))

const findPageManifests = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry)

    if (statSync(full).isDirectory()) return findPageManifests(full)

    // Route handlers have a manifest too, but send no JavaScript to a browser.
    return entry === 'page_client-reference-manifest.js' ? [full] : []
  })

/**
 *    Each manifest is a script that assigns to `globalThis.__RSC_MANIFEST`,
 *    keyed by the entry (`/(frontend)/blog/page`). `clientModules` lists every
 *    client module with the chunks that carry it for this entry; modules the
 *    entry does not use have an empty list. `chunks` alternates id and file.
 */
const readManifest = (file) => {
  const sandbox = {
    globalThis: {},
  }

  vm.runInNewContext(readFileSync(file, 'utf8'), sandbox)

  return Object.entries(sandbox.globalThis.__RSC_MANIFEST ?? {})
}

/**
 *    The manifest is not filtered per route: it lists the client modules of
 *    the whole app. What ties a module to a route is the last file in its
 *    chunk list, the client entry of the layout, template, loading state or
 *    page that imports it (`static/chunks/app/(frontend)/blog/page-<hash>.js`).
 *    A route loads the entries of its own page and of every segment above it.
 */
const ENTRY_CHUNK = /^static\/chunks\/app\/(?:(.*)\/)?(layout|template|loading|page)-[0-9a-f]+\.js$/

const isEntryOf = (entry, chunk) => {
  const match = ENTRY_CHUNK.exec(decodeURIComponent(chunk))

  if (!match) return false

  const [, dir = '', kind] = match
  const pageDir = entry.replace(/^\//, '').replace(/\/page$/, '')

  if (kind === 'page') return dir === pageDir

  return dir === '' || pageDir === dir || pageDir.startsWith(`${dir}/`)
}

// `/(frontend)/blog/[slug]/page` -> `/blog/[slug]`
const toRoute = (entry) =>
  entry
    .replace(/\/page$/, '')
    .split('/')
    .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
    .join('/') || '/'

const routes = findPageManifests(path.join(distDir, 'server', 'app'))
  .flatMap(readManifest)
  .map(([entry, manifest]) => {
    const files = new Set(sharedFiles)

    for (const { chunks } of Object.values(manifest.clientModules ?? {})) {
      const jsChunks = chunks.filter((chunk) => chunk.endsWith('.js'))

      if (jsChunks.some((chunk) => isEntryOf(entry, chunk))) {
        for (const chunk of jsChunks) files.add(chunk)
      }
    }

    const route = toRoute(entry)
    const bytes = [...files].reduce((total, file) => total + gzipSize(file), 0)
    const budget = BUDGETS.find(({ match }) => match(route))
    const kb = bytes / KB

    let status = 'not budgeted'

    if (budget) status = kb > budget.maxKb ? 'over' : kb > budget.targetKb ? 'above target' : 'ok'

    return {
      route,
      kb: Math.round(kb * 10) / 10,
      files: files.size,
      targetKb: budget?.targetKb ?? null,
      maxKb: budget?.maxKb ?? null,
      status,
    }
  })
  // Next's own pages; a visitor never navigates to them.
  .filter(({ route }) => !route.startsWith('/_'))
  .sort((a, b) => b.kb - a.kb)

const sharedKb =
  Math.round((sharedFiles.reduce((total, file) => total + gzipSize(file), 0) / KB) * 10) / 10

const over = routes.filter(({ status }) => status === 'over')

if (asJson) {
  console.log(
    JSON.stringify(
      {
        sharedKb,
        routes,
      },
      null,
      2,
    ),
  )
} else {
  const icon = {
    ok: '✅',
    'above target': '⚠️',
    over: '❌',
    'not budgeted': '➖',
  }

  const lines = [
    '## First-load JavaScript (gzipped)',
    '',
    `Shared by every route: **${sharedKb} kB**`,
    '',
    '| Route | First load | Target | Limit | |',
    '| --- | ---: | ---: | ---: | --- |',
    ...routes.map(
      ({ route, kb, targetKb, maxKb, status }) =>
        `| \`${route}\` | ${kb} kB | ${targetKb ? `${targetKb} kB` : 'none'} | ${maxKb ? `${maxKb} kB` : 'none'} | ${icon[status]} ${status} |`,
    ),
    '',
  ]

  console.log(lines.join('\n'))

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`)
  }

  for (const { route, kb, maxKb } of over) {
    // GitHub renders this as an annotation on the run.
    console.error(
      `::error title=Bundle budget exceeded::${route} loads ${kb} kB of JavaScript (budget ${maxKb} kB)`,
    )
  }
}

process.exit(over.length > 0 ? 1 : 0)
