# ROADMAP

Fleet control-plane roadmap. Landed work moves to the **Delivered** section with its proving evidence cited.

## In progress

- _None._

## Next

- **Deployment engine v0.2.0** — `platform: kubernetes` (own design round: kubeconfig secret handling, kubectl availability, native k8s manifests vs compose mapping).
- **Deployment engine v0.3+** — further common platforms, driven by demand.
- **Release trigger rollout to the 9 language templates** — uniform root `VERSION`, `core.hooksPath` wiring to hub hooks, onboarding docs (held: explicit operator go required).
- **Fresh reset endgame** — reset packages, recreate the repos as fresh public repositories with pristine commit history, each starting at tag `v0.1.0` with a matching release package (operator decision 2026-10-15; current private history is scaffolding).
- **Release creator attribution** — evaluate a fine-grained PAT so releases stop showing `github-actions[bot]` as creator (operator rejected the bot attribution; decision pending on the trade-off).
- **github-actions-runner repo: reusable-workflow adoption** — implement the hub reusable workflows for the `mantit0985/github-actions-runner` repo (bespoke `CI.yml`/`CD.yml` reworked toward the fleet reusable pattern), EXCLUDING the deploy workflow.

## Delivered (2026-10-15 - 2026-10-16)

- **Deployment engine v0.1.0, proven end-to-end on the canary** — Node action `.github/actions/deploy-engine` + reusable `deploy.yml`, manifest-driven compose stacks: validation refusal matrix, env materialization (`generated` materialized+symlinked, `file:` read in place), digest-pinned netns healthcheck probe, structured `-nomad` refusal proven, try/finally teardown + defensive `always()` cleanup. Fleet enablers: runner image rebuilt with the compose plugin (`mantit0985/github-actions-runner` CD) and itemized removal of 29 empty compose networks (address-pool exhaustion). Proof runs on `mantit0985/.github-testing`: 38828634951 (positive, green), 38828807704 (negative `nomad` refusal, zero side effects), 38828903478 (post-revert green re-run; stack running, healthz 200).

- **Release trigger, end-to-end on the canary** — pre-push gate with 4 assertions (tag==VERSION, tag==main tip, CI green, valid signature), server-side recheck in the reusable `release.yml`, changelog-sourced release bodies, slug-safe source tarball + `SHA256SUMS`, locally detached GPG signature, and the publish helper `.github/hooks/release-publish.sh` (proven at v0.1.2 and fully at v0.1.3).
- **ci-gate contracts** — callers enabling `enable_ci_gate` grant `actions: read` in their wrapper permissions; reusable `cd.yml` carries no job-level permissions (caller startup-failure lesson).
- **Canary reorg** — python mini-app under `python/`, Compose v2 stack files at root, coherent README with the Automation section.
