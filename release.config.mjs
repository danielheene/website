/**
 * semantic-release configuration.
 *
 * Runs on push to `main` (.github/workflows/release.yml) and drives the
 * version half of Sentry release tracking: it reads Conventional Commits
 * since the last tag, bumps package.json's `version`, commits that bump back
 * with a `[skip ci]` tag, and pushes a `vX.Y.Z` git tag.
 *
 * This package is never published to a registry — `npmPublish: false` keeps
 * @semantic-release/npm to its version-bump side effect only, which is the
 * one piece this repo actually needs.
 *
 * Dokploy then builds from the commit this workflow pushes, computes
 * SENTRY_RELEASE as `website@${the bumped version}` from that same
 * package.json, and next.config.ts's withSentryConfig `release.name` /
 * src/lib/sentry/options.ts's `release` both read that one value — see the
 * comments there for why they have to match byte-for-byte.
 *
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    'main',
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'package.json',
          'CHANGELOG.md',
        ],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
}
