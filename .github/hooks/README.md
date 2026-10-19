# Baseline Git Hooks

This directory is the shared hook baseline: the single source of truth that template repositories fetch their git hooks from, and where the hub repo sources its own hooks from.

## Inventory

| File | Purpose | Scope |
|------|---------|-------|
| `setup.sh` | Single entry-point installer: fetches the full hook baseline into the central host dir and wires the global git config | Baseline entry — invoked by `make hooks` |
| `commit-msg` | Rejects AI-attribution content from any assistant and enforces strict Conventional Commits | Template baseline — wired host-wide by `make hooks` |
| `pre-push` | Wrapper: every branch push lints changed documents; `v*` tag pushes run the release gate | Release wiring / hook baseline — wired locally or with release wiring |
| `doc-lint.sh` | Lints the `.md` and `.markdown` files changed in a push range with markdownlint-cli; repo config when present, hub baseline fetched from main otherwise | Baseline entry — invoked by `pre-push` |
| `release-gate.sh` | Validates a tag before push: tag == VERSION, tagged commit == origin/main tip, latest CI at that SHA green, GPG signature valid | Release wiring — fetched together with `pre-push` |
| `release-publish.sh` | Operator-machine helper: dispatch hub `release.yml`, watch, download, verify checksums, detach-sign SHA256SUMS, upload signature | Hub-internal — never fetched into template repos |

## Install in a spawned template repository

Template repositories carry no hook files. `make hooks` invokes the hub's single entry-point installer:

```sh
curl -fsSL https://raw.githubusercontent.com/mantit0985/.github/main/.github/hooks/setup.sh | sh
```

Run `make hooks` in any repo after cloning — `setup.sh` fetches the full hook baseline (`commit-msg`, `pre-push`, `doc-lint.sh`, `release-gate.sh`; `release-publish.sh` stays hub-internal) into the central host directory and wires the global git config, one copy per host, refreshed from this directory at `main` on every run. Every repo that uses the default hooks path picks the baseline up; a repo-local `core.hooksPath` overrides the global default (the hub keeps its in-repo wiring).

## Install in this hub repository

The hub consumes its own hooks in-repo (wired via the root Makefile):

```sh
git config core.hooksPath .github/hooks
```

## Release sequence

1. Merge a version-bump PR to `main`.
2. Create an annotated GPG-signed tag (`git tag -a vX.Y.Z -m "..."`) and push it.
3. The pre-push gate validates the tag; on pass, the hub release workflow publishes the GitHub Release.
4. Finalize with `release-publish.sh` (checksum-signature upload) on the operator machine.

## Escape hatch

`RELEASE_GATE_SKIP=i-accept-red-releases` temporarily disables the release gate for testing.

## Enforcement layers

Local hooks are early feedback. The real enforcement is in CI: the composite actions `commit-hygiene-gate` (used by `ci.yml`, `pr-validator.yml`, `cd.yml` and `release.yml`) fetch this same script from `main` and run it against every commit in the checked range, regardless of whether a local hook is installed; `release.yml` additionally runs the `release-actor-gate` action, restricting release acceptance to approved actors. The release workflow re-verifies the release-gate assertions server-side at the tag ref.

`commit-msg`, `pre-push` and `release-gate.sh` are POSIX-sh. `release-publish.sh` is bash (operator machine only).

## Commit subject contract

Subjects must follow strict Conventional Commits:

```text
<type>(<scope>)?: <description>
```

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Scope: optional, lowercase alphanumerics with `.`, `/`, `_`, `-`
- `!` before the colon marks breaking changes
- Description starts with a lowercase letter or digit
- No trailing period, no trailing whitespace, subject at most 72 characters
- The first line of the message is the subject; body lines have no format constraints
- Merge commits are not exempted — use squash or rebase merges
