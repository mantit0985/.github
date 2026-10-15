# GitHub Repo Control Plane Hooks

This directory hosts custom hook scripts used by the organization. They enforce release gate checks and prevent AI‑attribution lines in commits.

* **release-gate.sh** – Validates a tag before it is pushed. It checks the version file, commit identity, CI success and GPG signature.
* **pre‑push** – Wrapper that invokes *release‑gate.sh* for tags starting with `v`.
* **commit‑msg** – Prevents AI‑attribution strings in commit messages.

## Wiring a clone
```sh
git config core.hooksPath <repo-root>/.github/hooks
```

## Release sequence
1. Merge a version‑bump PR to `main`.
2. Create an annotated GPG‑signed tag (`git tag -a vX.Y.Z –m "…"`), push the tag.
3. Release workflow runs; if all checks pass it publishes a GitHub Release.

## Escape hatch
`RELEASE_GATE_SKIP=i-accept-red-releases` temporarily disables the gate for testing.

All scripts are POSIX‑sh compliant and designed to be run on any hosted runner.
## Release publishing (post-gate)

After the release gate passes and the signed tag is on origin, publish and verify locally:

`.github/hooks/release-publish.sh <owner/repo> <tag>`

Sequence: dispatches the hub `release.yml` workflow, watches it to success, downloads the source tarball + `SHA256SUMS`, verifies checksums, detach-signs `SHA256SUMS` with the local GPG key (override with `RELEASE_KEY=<keyid>`; default `5EFC12ED8C0F0586`), uploads `SHA256SUMS.sig` to the release, and verifies the signature. The private key never leaves the operator machine.
