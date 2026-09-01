// @ts-check

/**
 * Keeps families of packages that are released together on the same version.
 *
 * Payload, Storybook, Sentry and the others each publish a dozen packages from
 * one repo on a shared release train — mixing versions within a family causes
 * subtle runtime breakage rather than an install error, so it is worth
 * enforcing. Each family is held to a single range with `sameRange`: `snapTo` targets a
 * local workspace package, which this single-package repo does not have, so
 * matching ranges is the equivalent guarantee.
 *
 * Run `pnpm deps:lint` to check, `pnpm deps:fix` to apply.
 *
 * @type {import('syncpack').RcFile}
 */
export default {
  sortPackages:true,
  // Mirrors sort-package-json's own default `sortOrder`/alphabetized-content
  // list exactly (node_modules/sort-package-json's `fields` array — the
  // fields there marked `over: sortObject`/`sortDependencies`), so a
  // `syncpack fix` run and a `sort-package-json` run agree on both key
  // order (sortFirst below) and content order for these fields, instead of
  // re-shuffling each other's output on alternating commits.
  sortAz: [
    'maintainers',
    'contributors',
    'resolutions',
    'overrides',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
    'bundledDependencies',
    'bundleDependencies',
    'extensionPack',
    'extensionDependencies',
    'engines',
    'engineStrict',
    'preferGlobal',
    'publishConfig',
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
    'pnpm',
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
      packages: [
        '**',
      ],
      isIgnored: true,
    },

    {
      label: 'Payload CMS packages share a release train',
      dependencies: [
        'payload',
        '@payloadcms/**',
      ],
      packages: [
        '**',
      ],
      policy: 'sameRange',
    },

    {
      label: 'Storybook packages share a release train',
      dependencies: [
        'storybook',
        '@storybook/**',
      ],
      packages: [
        '**',
      ],
      policy: 'sameRange',
    },

    {
      label: 'Sentry packages share a release train',
      dependencies: [
        '@sentry/**',
      ],
      packages: [
        '**',
      ],
      preferVersion: 'highestSemver',
    },

    {
      label: 'Vitest packages share a release train',
      dependencies: [
        'vitest',
        '@vitest/**',
      ],
      packages: [
        '**',
      ],
      policy: 'sameRange',
    },

    /**
     * `playwright` and `@playwright/test` must match exactly: the Docker image
     * tag in scripts/e2e-docker.sh is pinned to this version, and a mismatch
     * means the bundled browser revisions disagree.
     */
    {
      label: 'Playwright must match the pinned browser image',
      dependencies: [
        'playwright',
        '@playwright/**',
      ],
      packages: [
        '**',
      ],
      policy: 'sameRange',
    },

    {
      label: 'React and its DOM/type packages move together',
      dependencies: [
        'react',
        'react-dom',
      ],
      packages: [
        '**',
      ],
      policy: 'sameRange',
    },
  ],

  /** Range styles, so a family bump does not silently change pinning strategy. */
  semverGroups: [
    {
      label: 'Playwright is pinned to a patch range to match the Docker image',
      dependencies: [
        'playwright',
        '@playwright/**',
      ],
      packages: [
        '**',
      ],
      range: '~',
    },
    {
      label: 'Exact pins that must not become ranges',
      dependencies: [
        // the pnpm patch is keyed to an exact version; a range would silently
        // stop applying it
        'pdfjs-dist',
        // pinned deliberately via resolutions to hold the v4 API
        'redis',
      ],
      packages: [
        '**',
      ],
      range: '',
    },
    {
      label: 'Everything else uses caret ranges',
      dependencies: [
        '**',
      ],
      packages: [
        '**',
      ],
      range: '^',
    },
  ],
}
