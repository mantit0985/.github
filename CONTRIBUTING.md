# Contributing

This is a documentation-only meta repository: it holds the profile README source and this repository's own workflow and template configuration. Changes here are edits to Markdown and YAML.

## Setup

Fork or clone, then create a branch directly. There is no build step or test suite.

## Branches

Branch names must use one of the prefixes enforced by `.github/workflows/pr-validator.yml`:

`feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`

PRs are validated against this and rejected otherwise.

## Pull requests

- Keep PRs focused on a single change.
- The PR body must reference an issue with `Closes #`, `Fixes #`, or `Resolves #` — `pr-validator.yml` checks for it.
- All status checks must pass before merge.
- Branch off and target `master`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`.

## Documentation standards

- Write the least amount of text required to convey the maximum amount of information.
- Documentation is code. Outdated documentation is a bug — fix it in the same PR that changes the thing it describes.

## Reporting issues

Search existing issues first, then use the bug report or feature request template with concrete reproduction steps and expected versus actual behavior.
