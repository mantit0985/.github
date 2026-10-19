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

## Template Governance (The Gold Standard)

All template repositories must adhere to the centralized governance model defined in this hub:

- **Workflow Centralization**: All CI/CD logic must be delegated to the hub's reusable workflows (`ci.yml` and `cd.yml`).
- **Thin Wrappers**: Template `.github/workflows/` files must contain only triggers and the call to the hub.
- **Symmetry Contract**: Exactly one CI and one CD run per trigger, with CD strictly gated by CI success.
- **Runner Standard**: All workflows must run on `self-hosted` runners.

Refer to `ONBOARDING.md` for implementation details.

### Cross-Repository `@main` References

Cross-repository `@main` references — hub workflows calling this repository's actions, and template wrappers calling the hub's reusable workflows — are **deliberate** under the canary-first rollout: changes are proven on a private validation ground before they reach consumers. SHA-pinning of these references is deferred to the fresh-reset/release decision.

### Shared Commit-Message Guard

Spawned and template repos ship `.githooks/commit-msg` (the shared commit-msg guard) plus a root `Makefile` whose default target installs hooks via `git config core.hooksPath .githooks` (this hub's Makefile installs the same guard from `.github/hooks`). AI attribution in commit messages is forbidden across all repositories.

## Release Versioning

All repositories version with Semantic Versioning (`MAJOR.MINOR.PATCH`), tagged `vX.Y.Z` and released through the signed-tag flow.

- **0.x — pre-stability.** Versions `0.y.z` signal active development: behavior may still change and nothing is stable yet. The first release of any repository — including the first release after a fresh re-creation — is **`v0.1.0`**, with a matching release package.
- **1.0.0 — reserved for the proven milestone.** `1.0.0` is only cut when a repo is settled and battle-tested and its contracts are ready to stabilize. From `1.0.0` on, breaking changes bump `MAJOR`.
- The mechanical release discipline (signed tags, pre-push release gate, server-side rechecks, changelog-sourced bodies) is specified in the release-trigger contract.

## Precedence

Local repository files always take precedence over account-level defaults stored in this `.github` repository.

## Compliance Audit

The following repositories were identified as missing required files during the RQE Phase 1 audit:

- `.githooks`: Missing README and LICENSE
- `playground`: Missing README and LICENSE
- `scripts`: Missing README and LICENSE
- `snippets`: Missing README and LICENSE
- `dotfiles`: Missing README
