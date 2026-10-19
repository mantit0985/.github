# Deploy Engine

## Purpose

Node.js standard-library only implementation of a *deploy-engine* that deploys Docker Compose stacks based on a manifest file. The action is meant to be used as the reusable entry-point in the

```text
mantit0985/.github/.github/workflows/deploy.yml@main
```

which can be invoked through both `workflow_call` and `workflow_dispatch`.

## Manifest Contract (v1)

The manifest is a JSON file (default `deploy/deployments.json` unless overridden by `INPUT_MANIFEST_PATH`). Its shape is written into the code and is validated at runtime. The exported schema is:

```json
{
  "version": 1,
  "deployments": [
    {
      "name": "<string, non-empty>",
      "platform": "docker",                                   // only docker is supported
      "context": {
        "type": "socket" | "ssh",
        // socket: no extra fields
        // ssh: require { host: "<string, non-empty>" }
        "host": "<string>"  // present only for ssh
      },
      "project_name": "<string, non-empty>",
      "compose_file": "<relative-path> (must exist)",
      "env_files": [
        {
          "path": "<relative-path> (must exist)",
          "source": "generated" | "file:<relative-path>" | "secret:<NAME>"
        }
      ],
      "healthcheck": {
        "url": "<string, non-empty>",
        "retries": <positive integer>,
        "interval_seconds": <positive integer>,
        // optional
        "service": "<string, non-empty>"
      }
    }
  ]
}
```

### Validation Rules

* `version` must equal `1`.
* `deployments` must be an array.
* `platform` must be the string `docker`.
* Context type may be `socket` or `ssh`. An `ssh` context must contain a non-empty `host` field.
* `project_name` must be a non-empty string.
* `compose_file` must resolve (relative to the repo root) to a regular file.
* Each `env_files` entry:
  * `path` must be a non-empty string.
  * `source` may be:
    * `generated` — the engine will create a 32-byte random secret.
    * `file:<path>` — the path must exist inside the repository and must not escape the checkout.
    * `secret:<NAME>` — the engine *v1* refuses such entries with an explicit error.
* Healthcheck:
  * `url` must be a non-empty string.
  * `retries` and `interval_seconds` must be positive integers.
  * `service` if present must be a non-empty string.

Any violation causes the action to exit with an error that is emitted using GitHub Actions `::error::` syntax.

## Healthcheck Semantics

The health-check is performed *inside the network namespace* of the container that implements the stack. This is achieved with the disposable probe image

```text
busybox@sha256:fd7dc98638c8e305f4dc34e979f1c0fdfdcaeb0fbf8fcff77ae834b6da3d7e6e
```

The image is pulled once for the runner host and again for the gate host, both via a digest-checked pull. For each health-check the engine

1. Resolves the container ID(s) using `docker compose ps -q`.
2. If `healthcheck.service` is specified, the target is that service; otherwise the first container in the project is used.
3. If *exactly one* container is found, the engine runs

   ```sh
   docker run --rm --network container:<container-id> busybox wget -q -T 5 -O /dev/null <url>
   ```

   Repeat `retries` times, waiting `interval_seconds` between attempts.
4. If the probe fails `retries` times, the action triggers a rollback (`docker compose down`) for the affected deployment and exits with an error.

Because the probe runs in the container's own network namespace, `healthcheck.url` must refer to the **container-side** port (i.e. the loopback address inside the stack). Any published host ports are merely for operator access and are not involved in the health-check.

## Lifecycle

1. **Validate** — parse the manifest JSON and run the validation checks described above.
2. **Materialize** — create a temporary directory under `${RUNNER_TEMP}/deploy-engine/${RUN_ID}`. For every `generated` env_file a 32-byte hex secret is written and symlinked into the repository path.
3. **Deploy** — run `docker compose -p <project> -f <compose-file> up -d --build` for each deployment in the order supplied in the manifest. SSH contexts cause an `ssh-agent` to be started per deployment.
4. **Healthcheck** — run the probe described in Section 3. On failure the stack is immediately torn down.
5. **Teardown** — after all deployments have succeeded, or after a failure, the action cleans up:
   * symlinks are removed.
   * temporary files and the temporary base directory are deleted.
   * any SSH agents are killed.
   * any added known-hosts entries are removed.
   The list of cleanup paths is emitted to `${GITHUB_OUTPUT}` as `cleanup_paths` using a multi-line block.

All cleanup is performed in an `always()` step so the environment is left in a clean state regardless of success or failure.

## Operational Requirements

* The runner must have the Docker Compose CLI plugin.
* Each stack must use distinct host ports; otherwise port collisions can occur. The script does **not** perform any port-scanning.
* Orphaned `<project>_default` networks are removed by `docker compose down` — make sure that does not create side effects.
* `docker network prune` is explicitly *not* invoked by the engine.

## Proven Run History

| Run ID | Result | Notes |
|---------|--------|-------|
| 38828634951 | green | Successful deploy and health-check |
| 38828807704 | refused | nomad refusal, no side effects |
| 38828903478 | green | stack running, healthz returned 200 |

Those runs were executed on the deploy engine from the reference template `mantit0985/deploy-template`.
