/**
 * semantic-release configuration.
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    'main',
    // develop cuts release candidates (e.g. 1.13.0-rc.1) ahead of the next main release
    {
      name: 'develop',
      prerelease: 'rc',
      channel: 'rc',
    },
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
        assets: ['package.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
}
