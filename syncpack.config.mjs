// @ts-check

/**
 * Keeps families of packages that are released together on the same version.
 *
 * Payload, Storybook and the others each publish a dozen packages from
 * one repo on a shared release train — mixing versions within a family causes
 * subtle runtime breakage rather than an install error, so it is worth
 * enforcing. Each family is held to a single range with `sameRange`: `snapTo` targets a
 * local workspace package, which this single-package repo does not have, so
 * matching ranges is the equivalent guarantee.
 *
 * Run `bun run deps:lint` to check, `bun run deps:fix` to apply.
 *
 * @type {import('syncpack').RcFile}
 */
export default {
  sortPackages: true,
  // Mirrors sort-package-json's own default `sortOrder`/alphabetized-content
  // list exactly (node_modules/sort-package-json's `fields` array — the
  // fields there marked `over: sortObject`/`sortDependencies`), so a
  // `syncpack fix` run and a `sort-package-json` run agree on both key
  // order (sortFirst below) and content order for these fields, instead of
  // re-shuffling each other's output on alternating commits.
  sortAz: [
    'bundledDependencies',
    'bundleDependencies',
    'contributors',
    'dependencies',
    'devDependencies',
    'engines',
    'engineStrict',
    'extensionDependencies',
    'extensionPack',
    'maintainers',
    'optionalDependencies',
    'overrides',
    'peerDependencies',
    'preferGlobal',
    'publishConfig',
    'resolutions',
    'scripts',
  ],
  // Full sort-package-json default field order (see that package's `fields`
  // array) — kept complete rather than trimmed to this repo's current
  // fields, so it stays correct as fields are added later.
  sortFirst: [
    '$schema',
    'name',
    'displayName',
    'version',
    'stableVersion',
    'private',
    'description',
    'categories',
    'keywords',
    'homepage',
    'bugs',
    'repository',
    'funding',
    'license',
    'qna',
    'author',
    'maintainers',
    'contributors',
    'publisher',
    'sideEffects',
    'type',
    'imports',
    'exports',
    'main',
    'svelte',
    'umd:main',
    'jsdelivr',
    'unpkg',
    'module',
    'source',
    'jsnext:main',
    'browser',
    'react-native',
    'types',
    'typesVersions',
    'typings',
    'style',
    'example',
    'examplestyle',
    'assets',
    'bin',
    'man',
    'directories',
    'files',
    'workspaces',
    'binary',
    'scripts',
    'betterScripts',
    'wireit',
    'l10n',
    'contributes',
    'activationEvents',
    'husky',
    'simple-git-hooks',
    'pre-commit',
    'commitlint',
    'lint-staged',
    'nano-staged',
    'config',
    'nodemonConfig',
    'browserify',
    'babel',
    'browserslist',
    'xo',
    'prettier',
    'eslintConfig',
    'eslintIgnore',
    'npmpkgjsonlint',
    'npmPackageJsonLintConfig',
    'npmpackagejsonlint',
    'release',
    'remarkConfig',
    'stylelint',
    'ava',
    'jest',
    'jest-junit',
    'jest-stare',
    'mocha',
    'nyc',
    'c8',
    'tap',
    'oclif',
    'resolutions',
    'overrides',
    'dependencies',
    'devDependencies',
    'dependenciesMeta',
    'peerDependencies',
    'peerDependenciesMeta',
    'optionalDependencies',
    'bundledDependencies',
    'bundleDependencies',
    'extensionPack',
    'extensionDependencies',
    'flat',
    'packageManager',
    'engines',
    'engineStrict',
    'devEngines',
    'volta',
    'languageName',
    'os',
    'cpu',
    'preferGlobal',
    'publishConfig',
    'icon',
    'badges',
    'galleryBanner',
    'preview',
    'markdown',
  ],
  source: ['package.json', 'apps/*/package.json', 'packages/*/package.json'],

  versionGroups: [
    /**
     * Packages that live in a family's namespace but are versioned
     * independently. Listing them first means the family rules below never
     * see them.
     */
    {
      label: 'Independently versioned, despite the shared namespace',
      dependencies: [
        // Storybook's compiler addons track the bundler, not Storybook
        '@storybook/addon-webpack5-compiler-swc',
        // each Radix primitive ships on its own release line
        '@radix-ui/**',
        // changelog-github is 0.x while the CLI is 2.x
        '@changesets/changelog-github',
      ],
      packages: ['**'],
      isIgnored: true,
    },

    {
      label: 'Payload CMS packages share a release train',
      dependencies: ['payload', '@payloadcms/**'],
      packages: ['**'],
      policy: 'sameRange',
    },

    {
      label: 'Storybook packages share a release train',
      dependencies: ['storybook', '@storybook/**'],
      packages: ['**'],
      policy: 'sameRange',
    },

    {
      label: 'Vitest packages share a release train',
      dependencies: ['vitest', '@vitest/**'],
      packages: ['**'],
      policy: 'sameRange',
    },

    /**
     * `playwright` and `@playwright/test` must be on the identical version:
     * each bundles its own browser revisions, and scripts/e2e-docker.sh picks
     * the Docker image tag from the installed `@playwright/test`.
     *
     * Pinned rather than `sameRange`: syncpack only compares one dependency
     * across packages, never two dependencies with each other, so in this
     * single-package repo a policy group cannot catch a mismatch. To upgrade
     * Playwright, change this one value and run `bun run deps:fix`.
     */
    {
      label: 'Playwright packages are pinned to one version',
      dependencies: ['playwright', '@playwright/**'],
      packages: ['**'],
      pinVersion: '~1.65.0',
    },

    {
      label: 'React and its DOM/type packages move together',
      dependencies: ['react', 'react-dom'],
      packages: ['**'],
      policy: 'sameRange',
    },
  ],

  /** Range styles, so a family bump does not silently change pinning strategy. */
  semverGroups: [
    {
      label: 'Playwright is pinned to a patch range to match the Docker image',
      dependencies: ['playwright', '@playwright/**'],
      packages: ['**'],
      range: '~',
    },
    {
      label: 'Exact pins that must not become ranges',
      dependencies: ['pdfjs-dist'],
      packages: ['**'],
      range: '',
    },
    {
      label: 'Everything else uses caret ranges',
      dependencies: ['**'],
      packages: ['**'],
      range: '^',
    },
  ],
}
