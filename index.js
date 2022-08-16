// @ts-check

/**
 * @type {import('semantic-release').Options}
 **/
const options = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogTitle: `# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.`,
      },
    ],
    [
      '@semantic-release/npm',
      {
        tarballDir: '.semantic-release',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package-lock.json',
          'package.json',
          'pnpm-lock.yaml',
          'yarn.lock',
        ],
        message: `chore(release): $\{nextRelease.version} [skip ci]

$\{nextRelease.notes}`,
      },
    ],
    [
      '@semantic-release/github',
      {
        addReleases: 'bottom',
        assets: '.semantic-release/*.tgz',
      },
    ],
  ],
}

module.exports = options
