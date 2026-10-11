# Maintenance Guide

This repository manages the account-wide configuration and governance for `mantit0985`.

## Workflow Inventory

| Workflow | Trigger | Purpose |
| :--- | :--- | :--- |
| `lint-markdown.yml` | Push/PR to `.md` files | Ensures documentation consistency via markdownlint. |
| `pr-validator.yml` | Pull Request | Enforces branch naming and issue referencing. |
| `pr-labeler.yml` | Pull Request | Automatically applies labels based on changed files. |

Dependabot is configured for the `github-actions` ecosystem with weekly updates.

## Secret Management

All workflows operate using the default `GITHUB_TOKEN`. No personal access tokens (PATs) are stored in this repository. If `workflow_call` functionality is extended to other repositories, a scoped `GH_PAT` may be required.

## Automation and Labeling

The `pr-labeler.yml` workflow uses a local composite action to apply labels:

- `governance`: Applied to changes within the `.github/` directory.
- `documentation`: Applied to changes in Markdown files or the `profile/` directory.

## Operational Tasks

- **Profile Updates**: Edit `profile/README.md` and push to `main` to update the public account profile.
- **Linter Updates**: Update the `DavidAnson/markdownlint-cli2-action` version. SHA-pinning is the preferred long-term strategy.
- **Workflow Deactivation**: If a workflow file is removed, disable the registration via the GitHub API:

  ```bash
  gh api -X PUT repos/mantit0985/.github/actions/workflows/<id>/disable
  ```

## Troubleshooting

- **GH007 Push Error**: Occurs when commits use a private email. Use the GitHub noreply address: `282219401+mantit0985@users.noreply.github.com`.
- **Lint Failures**: Run `markdownlint` locally or review the action logs for specific rule violations.
- **Validation Failures**: Ensure the branch name has a valid prefix and the PR body contains a `Closes #`, `Fixes #`, or `Resolves #` reference.
