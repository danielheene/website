import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsdown'

/**
 * Bundles the shared `@website/*` packages so they can be consumed as real
 * packages (ESM + `.d.ts`) outside this repository.
 *
 * `devExports: true` keeps the `exports` field pointing at the TypeScript
 * sources, which is what the apps, the Payload CLI and Vitest resolve during
 * development — so nothing changes for them. The compiled `dist/*` output is
 * advertised through `publishConfig.exports` and only takes effect when the
 * package is published.
 */
const packageDir = (name: string) => fileURLToPath(new URL(`packages/${name}`, import.meta.url))

const shared = {
  outDir: 'dist',
  format: 'esm',
  target: 'es2022',
  platform: 'neutral',
  dts: {
    // TypeScript 7's `tsgo` emits declarations next to the sources unless an
    // out dir is set, which would both pollute `src/` and shadow the source
    // modules in later builds.
    compilerOptions: { outDir: 'dist', declarationDir: 'dist' },
  },
  sourcemap: true,
  clean: true,
  unbundle: true,
} as const

/**
 * Non-code files exported from a package. tsdown generates `exports` entries
 * for the modules it bundles but not for assets, so each asset needs an
 * explicit entry (and, for the published package, a copy in `dist/`).
 */
const assets: Record<string, string[]> = {
  '@website/components': [
    'Shaders/DarkVeil/thumbnail.png',
    'Shaders/FaultyTerminal/thumbnail.png',
    'Shaders/GradientBlinds/thumbnail.png',
    'Shaders/Grainient/thumbnail.png',
  ],
  '@website/app-components': ['DuoTone/DuoTone.style.css'],
}

const customExports = (
  exports: Record<string, unknown>,
  { isPublish, pkg }: { isPublish: boolean; pkg: { name: string } },
) => {
  // tsdown's `./*` fallback points at the package root, so a subpath like
  // `@website/components/Badge/index` (which the apps use) would miss `src/`.
  // Point the fallback at the source tree in development and the compiled tree
  // when published; explicit entries still take precedence.
  exports['./*'] = isPublish ? './dist/*.js' : './src/*'

  for (const asset of assets[pkg.name] ?? []) {
    exports[`./${asset}`] = isPublish ? `./dist/${asset}` : `./src/${asset}`
  }

  return exports
}

const entry = (extensions: string[]) => [
  ...extensions.map((extension) => `src/**/*.${extension}`),
  ...extensions.map((extension) => `!src/**/*.test.${extension}`),
  '!src/**/*.d.ts',
]

/** Every package gets the exports handling, whether or not it ships assets. */
const config = { ...shared, exports: { devExports: true, all: true, customExports } }

export default defineConfig([
  {
    ...config,
    name: '@website/types',
    cwd: packageDir('types'),
    entry: entry(['ts']),
  },
  {
    ...config,
    name: '@website/lib',
    cwd: packageDir('lib'),
    entry: entry(['ts']),
  },
  {
    ...config,
    name: '@website/components',
    cwd: packageDir('components'),
    entry: entry(['ts', 'tsx']),
    copy: [{ from: 'src/**/*.png', to: 'dist', flatten: false }],
  },
  {
    ...config,
    name: '@website/app-components',
    cwd: packageDir('app-components'),
    entry: entry(['ts', 'tsx']),
  },
])
