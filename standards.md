# mantit0985 Repository Standards

This document defines the account-wide documentation and repository hygiene standards for all repositories under `mantit0985`.

## Required repository files

Every public repository must contain, at minimum:

- `README.md` — describes the project, how to use it, and how to contribute.
- `LICENSE` — the license under which the project is distributed.

These files may live in the repository root. If a repository does not provide its own version, GitHub falls back to the default files in this `.github` repository.

## Profile README

The public GitHub profile uses `profile/README.md` from this `.github` repository. Edit that file to update the profile page.

## Community health files

This repository provides default community health files for all repositories in the account:

- `.github/CODE_OF_CONDUCT.md`
- `.github/CONTRIBUTING.md`
- `.github/SECURITY.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/*`

Repositories may override these by providing their own versions in their `.github/` directory.

## Issue and pull request templates

Issue templates must include valid frontmatter:

- Markdown templates require `name:` and `about:`.
- YAML issue forms require `name:` and `description:`.

Pull request descriptions must link to a related issue using `Closes #123`, `Fixes #123`, or `Resolves #123`.

## Repository-specific overrides

A repository may override any default file by placing its own version in the same relative path. The local version takes precedence over the account-level default.

## RQE Phase 1 findings

The following repositories were identified as missing required files during RQE Phase 1. They should be created or populated according to this standard once they exist:

- `.githooks` — missing README and LICENSE (issues #4, #5)
- `playground` — missing README and LICENSE (issues #6, #7)
- `scripts` — missing README and LICENSE (issues #8, #9)
- `snippets` — missing README and LICENSE (issues #10, #11)
- `dotfiles` — missing README (issue #13)
