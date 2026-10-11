# Repository Standards

This document defines the documentation and hygiene standards for all repositories under the `mantit0985` account.

## Mandatory Repository Files

Every public repository must include the following files at the root:

- `README.md`: Project description, usage guide, and contribution instructions.
- `LICENSE`: The legal license under which the project is distributed.

Repositories that do not provide these files will inherit the defaults defined in this `.github` repository.

## Profile Configuration

The public GitHub profile is driven by `profile/README.md` in this repository. All updates to the account bio and profile should be made here.

## Community Health Defaults

This repository provides global defaults for the following files:

- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `PULL_REQUEST_TEMPLATE.md`
- `ISSUE_TEMPLATE/*`

Repositories may override these defaults by providing their own versions in their local `.github/` directory.

## Template Requirements

### Issue Templates

Templates must include valid frontmatter:
- **Markdown**: `name:` and `about:`.
- **YAML Forms**: `name:` and `description:`.

### Pull Requests

PR descriptions must explicitly link to a related issue using one of the following keywords: `Closes #`, `Fixes #`, or `Resolves #`.

## Precedence

Local repository files always take precedence over account-level defaults stored in this `.github` repository.

## Compliance Audit

The following repositories were identified as missing required files during the RQE Phase 1 audit:

- `.githooks`: Missing README and LICENSE
- `playground`: Missing README and LICENSE
- `scripts`: Missing README and LICENSE
- `snippets`: Missing README and LICENSE
- `dotfiles`: Missing README
