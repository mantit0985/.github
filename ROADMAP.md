# ROADMAP

Fleet control-plane roadmap. Landed work moves to the **Delivered** section with its proving evidence cited.

## In progress

### Deployment engine (v1) — hub `.github/workflows/deploy.yml` + `deploy/deployments.json`
- Data-driven pipeline: a JSON manifest in the consuming repo declares deployments; the hub engine reads it with `jq` and executes.
- Manifest schema v1: `name`, `platform` (`docker` in v1), `context` (socket | ssh), `compose_file`, `project_name`, `env_files` with sources `secret:<NAME>` | `generated` | `file:<path>`, `healthcheck` (url/retries/interval).
- Engine behavior: validate manifest → materialize env files at deploy time (600-perm temp files, secret values masked, never echoed, cleaned up) → `docker compose -p <project> up -d --build` on the declared context → health probe → teardown.
- Proving ground: the canary `mantit0985/.github-testing` compose stack (`compose.yaml` + `compose.override.yaml`).

## Next

- **Deployment engine v2** — `platform: kubernetes` (own design round: kubeconfig secret handling, kubectl availability, native k8s manifests vs compose mapping).
- **Deployment engine v3+** — further common platforms, driven by demand.
- **Release trigger rollout to the 9 language templates** — uniform root `VERSION`, `core.hooksPath` wiring to hub hooks, onboarding docs (held: explicit operator go required).
- **Fresh reset endgame** — reset packages, recreate the repos as fresh public repositories with pristine commit history, each starting at tag `v0.1.0` with a matching release package (operator decision 2026-10-15; current private history is scaffolding).
- **Release creator attribution** — evaluate a fine-grained PAT so releases stop showing `github-actions[bot]` as creator (operator rejected the bot attribution; decision pending on the trade-off).

## Delivered (2026-10-15)

- **Release trigger, end-to-end on the canary** — pre-push gate with 4 assertions (tag==VERSION, tag==main tip, CI green, valid signature), server-side recheck in the reusable `release.yml`, changelog-sourced release bodies, slug-safe source tarball + `SHA256SUMS`, locally detached GPG signature, and the publish helper `.github/hooks/release-publish.sh` (proven at v0.1.2 and fully at v0.1.3).
- **ci-gate contracts** — callers enabling `enable_ci_gate` grant `actions: read` in their wrapper permissions; reusable `cd.yml` carries no job-level permissions (caller startup-failure lesson).
- **Canary reorg** — python mini-app under `python/`, Compose v2 stack files at root, coherent README with the Automation section.
