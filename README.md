# .github

Account-wide configuration hub for `mantit0985`. This repo provides the public profile README and repository-level hygiene settings; it is not a software project and holds no application code.

## Contents

- `profile/README.md`: Source of the public profile README rendered at `github.com/mantit0985`. Edit it here; changes appear on the profile page directly.
- `.github/workflows/`: Markdown linting, PR validation, and PR labeling for this repository.
- `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`: Issue and PR forms for this repository.
- `CONTRIBUTING.md`: Rules for contributing to this repository.
- `MAINTENANCE.md`: How to maintain the workflows and settings in this repo.

## Account-level defaults

This repository also acts as a GitHub account-level `.github` repository. Default community health files and issue/PR templates stored here are inherited by other `mantit0985` repositories that do not define their own. See [standards.md](standards.md) for the full account-wide documentation contract.

## Contributing

Branch names must follow the prefixes enforced by `pr-validator.yml` (`feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, or `gh-dev-loop/`), commits use Conventional Commits, and PRs must reference an issue. See [CONTRIBUTING.md](CONTRIBUTING.md).
