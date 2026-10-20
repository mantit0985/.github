# Changelog

## v0.2.0

### Added

- publish-release composite action embedded as the final CD step (gates: tag==VERSION, commit hygiene, latest-CI-success, annotated+signed tag)
- deploy job grants contents:write so release creation and asset upload succeed
- pr-validator template-section check repaired to true-OR semantics

## v0.1.0

### Added

- reusable workflow contracts: `ci.yml` (language-agnostic CI with smoke gate), `cd.yml` (multi-arch container deploy), `deploy.yml`, and the release machinery in `release.yml` with its signed-tag gate and SHA256SUMS publication
- shared hook baseline under `.github/hooks` (commit-msg guard, doc-lint, release gate) with the `make hooks` wiring installer
- composite actions: `commit-hygiene-gate` and `smoke-test`
- governance workflows: PR validator, PR labeler, runner heartbeat, and the new self-CI
- baseline documentation: standards, onboarding, maintenance, security, contributing guides, and profile

### Verify this release

```bash
sha256sum -c SHA256SUMS
```
