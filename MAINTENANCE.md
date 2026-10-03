# Maintenance

This repository is the account-wide configuration hub for `mantit0985`. It contains the profile README source and repository hygiene settings for itself only.

## Current workflows

| Workflow | Trigger | Secrets |
| :--- | :--- | :--- |
| `.github/workflows/lint-markdown.yml` | Push or PR touching `.md` files, manual dispatch | None (checkout plus markdownlint action) |
| `.github/workflows/pr-validator.yml` | Pull request opened, edited, or synchronized | Default `GITHUB_TOKEN` |
| `.github/workflows/pr-labeler.yml` | Pull request opened or synchronized | Default `GITHUB_TOKEN` |

Dependabot is configured for the `github-actions` ecosystem (weekly).

## Secrets

No personal access tokens are required. All workflows run on the default `GITHUB_TOKEN`. A scoped `GH_PAT` is only needed if `workflow_call` from other repositories is introduced later; `lint-markdown.yml` already declares `workflow_call` for that possibility.

## Labeling

`pr-labeler.yml` uses the local composite action `.github/actions/pr-labeler`. It applies `governance` for `.github/` changes and `documentation` for Markdown or `profile/` changes. The `governance` label was created manually with `gh label create` because nothing else provisions it.

## Tasks

- **Rebuild the profile README**: edit `profile/README.md` and push. There is no automation on it.
- **Update the linter action**: `lint-markdown.yml` pins `DavidAnson/markdownlint-cli2-action`. SHA-pinning the version is preferable long-term.
- **Disable stale workflows**: if a workflow file is deleted here, its registration on GitHub stays enabled and triggers from old default-branch history. Disable it via `gh api -X PUT repos/mantit0985/.github/actions/workflows/<id>/disable`.

## Troubleshooting

- **`GH007` error on push**: GitHub is rejecting a push because the commit was authored with a private email. Set Git to use the noreply address: `282219401+mantit0985@users.noreply.github.com`.
- **Lint failure on push**: run `markdownlint` locally against the changed files, or check the action log, which names the file and rule.
- **PRs failing validation**: `pr-validator.yml` requires a branch name with an enforced prefix and a `Closes #`, `Fixes #`, or `Resolves #` reference in the body. Edit the PR body, not the branch, if only the issue reference is missing.
