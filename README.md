<!-- markdownlint-disable-file MD025 -->

# @sanity/semantic-release-preset <!-- omit in toc -->

[![npm (scoped)](https://img.shields.io/npm/v/@sanity/semantic-release-preset.svg)](https://www.npmjs.com/package/@sanity/semantic-release-preset)
![Lint CI](https://github.com/sanity-io/semantic-release-preset/workflows/Lint/badge.svg)

# Features <!-- omit in toc -->

- Uses [Conventional Commits](https://www.conventionalcommits.org/) to generate [release notes](https://github.com/semantic-release/release-notes-generator), [changelogs](https://github.com/semantic-release/changelog) and [determine the version for new releases](https://github.com/semantic-release/commit-analyzer).
- [Creates or updates a CHANGELOG.md file](https://github.com/semantic-release/changelog).
- [Publishes to npm](https://github.com/semantic-release/npm).
- [Creates a new release on GitHub](https://github.com/semantic-release/github)
- [Updates GitHub issues and PRs that are resolved by a new release](https://github.com/semantic-release/github#successcomment).
- [Commits and pushes the current `version` to `package.json`](https://github.com/semantic-release/git).
- [Keep the year in LICENSE up to date](https://github.com/cbhq/semantic-release-license).

# Table of contents <!-- omit in toc -->

- [Usage](#usage)
  - [Setup the release config](#setup-the-release-config)
    - [Optional: Configure prerelease branches](#optional-configure-prerelease-branches)
  - [Minimal GitHub Release workflow](#minimal-github-release-workflow)
    - [If you're unable to make it work chances are your issue is documented in the `semantic-release` troubleshooting docs](#if-youre-unable-to-make-it-work-chances-are-your-issue-is-documented-in-the-semantic-release-troubleshooting-docs)
  - [Opinionated GitHub Release workflow](#opinionated-github-release-workflow)
    - [TODO more docs are coming, we're actively exploring the optimal setup](#todo-more-docs-are-coming-were-actively-exploring-the-optimal-setup)
- [Next steps, for even more automation](#next-steps-for-even-more-automation)

# Usage

```bash
npm i -D @sanity/semantic-release-preset
```

If your package manager don't auto install peer dependencies make sure to install `semantic-release`:

```bash
npm i -D semantic-release
```

## Setup the release config

Create a `.releaserc.json`:

```json
{
  "extends": "@sanity/semantic-release-preset",
  "branches": ["main"]
}
```

The `branches` array is [mandatory](https://semantic-release.gitbook.io/semantic-release/usage/configuration#branches), and in most repositories you should put the default git branch here (`main`, or `master` if it's an older repository).

### Optional: Configure prerelease branches

If you have stable releases going out from the git branch `main`, and want commits on the branch `beta` to result in only being installable with the npm dist-tag `beta`:

```bash
npm i package-name@beta
```

But not on:

```bash
npm i package-name # or npm i package-name@latest
```

Then use this config:

```json
{
  "extends": "@sanity/semantic-release-preset",
  "branches": ["main", {"name": "beta", "prerelease": true}]
}
```

## Minimal GitHub Release workflow

This is the bare minimum required steps to trigger a new release. This will push a new release every time an eliglible commit is pushed to git. Check the opinionated flow to see how to trigger releases manually.
Create `.github/workflows/ci.yml`:

```yml
---
name: CI

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          # Need to fetch entire commit history to
          # analyze every commit since last release
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          cache: npm
          node-version: lts/*
      - run: npm ci
      - run: npm test --if-present
      # Branches that will release new versions are defined in .releaserc.json
      # @TODO uncomment after verifying with --dry-run we're ready to go
      # - run: npx semantic-release
      - run: npx semantic-release --dry-run
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_PUBLISH_TOKEN }}
```

It's important that you use `--dry-run` in the `npx semantic-release` command until you've verified that `semantic-release` is setup correctly and is able to detect your release branches and published version numbers.
If you don't you may accidentally release a wrong version on `npm`, [know that you can't simply unpublish accidents](https://docs.npmjs.com/policies/unpublish) so it's best to be safe.

[You need two secrets](https://semantic-release.gitbook.io/semantic-release/usage/ci-configuration#authentication-for-plugins), `secrets.GITHUB_TOKEN` is always provided to GitHub actions, but if you try to `--dry-run` locally [you'll need to create a token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line).
It's easiest to just push commits and inspect the workflow output. You can add `--debug` to the `npx semantic-release` command to see more verbose logs if there's a tricky error.

The `secrets.NPM_PUBLISH_TOKEN` is provided on our GitHub org. If you're outside it you'll need to [create it](https://docs.npmjs.com/getting-started/working_with_tokens#how-to-create-new-tokens) with [`auth-only` 2FA](https://docs.npmjs.com/about-two-factor-authentication) and [add it to the repository secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-an-environment).

### If you're unable to make it work chances are your issue is documented in the `semantic-release` [troubleshooting docs](https://semantic-release.gitbook.io/semantic-release/support/troubleshooting)

Once you've confirmed with `--dry-run` that everything is looking good and `semantic-release` will perform the actions you expect it to, go ahead and edit `.github/workflows/release.yml`:

```yml
---
name: CI

on:
  # Build on pushes branches that have a PR (including drafts)
  pull_request:
  # Build on commits pushed to branches without a PR if it's in the allowlist
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          # Need to fetch entire commit history to
          # analyze every commit since last release
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          cache: npm
          node-version: lts/*
      - run: npm ci
      - run: npm test --if-present
      # Branches that will release new versions are defined in .releaserc.json
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_PUBLISH_TOKEN }}
```

If this is on a brand new package that haven't published to npm yet, make a commit like this:

```bash
git add .github/workflows/release.yml
git commit -m "feat: initial release"
git push
```

If you're onboarding a package that already has a published version history:

```bash
git add .github/workflows/release.yml
git commit -m "fix: use semantic-release"
git push
```

Check the [Release Workflow docs](https://semantic-release.gitbook.io/semantic-release/recipes/release-workflow) for more information.

## Opinionated GitHub Release workflow

1. This flow runs a `build` task for linting and things that only need to run once.
2. Runs `test`, which runs a matrix of operating systems and Node.js versions.
3. FInally, runs `release`, if the workflow started from a `workflow_dispatch`, it is skipped on `push`.

### TODO more docs are coming, we're actively exploring the optimal setup

# Next steps, for even more automation

- Setup [Renovatebot](https://docs.renovatebot.com/) dependencies automation [with our preset](https://github.com/sanity-io/renovate-presets/blob/master/ecosystem/README.md).
