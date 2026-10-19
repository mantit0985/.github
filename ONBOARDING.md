# Onboarding Guide

This guide describes how to integrate a new template repository into the `mantit0985` template estate while adhering to the **Gold Standard** and the **Symmetry Contract**.

## Quick Start

To onboard a new repository, follow these steps to implement the "Thin Wrapper" model.

### 1. Configure CI (`.github/workflows/ci.yml`)

Create a `ci.yml` file that delegates all logic to the hub.

```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    uses: mantit0985/.github/.github/workflows/ci.yml@main
    with:
      language: 'your-language' # e.g., 'rust', 'python', 'go', 'cpp', 'nodejs', 'zig'
      smoke-image: 'your-repo:slim'
      # Optional: Add if you need a custom image build before the smoke test
      build-verify-cmd: 'docker build --target runtime-slim -t your-repo:slim .'
```

### 2. Configure CD (`.github/workflows/cd.yml`)

Create a `cd.yml` file that delegates deployment to the hub.

```yaml
name: CD
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  cd:
    # The Symmetry Contract: Only deploy if CI succeeded
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    uses: mantit0985/.github/.github/workflows/cd.yml@main
    with:
      image_name: 'your-repo'
      # Optional: Enable if your repo requires strict API-based CI gating
      enable_ci_gate: false
      # Optional: Specialized binary release command
      release_cmd: ''
      release_artifact_path: ''
```

> **NOTE:** Callers enabling `enable_ci_gate` must declare `actions: read` (with `contents: read`) in their wrapper workflow's permissions — the ci-gate job queries the Actions API.

## The Symmetry Contract

Every template repository MUST maintain exactly one CI run and one CD run per trigger.

- **CI**: Handles quality, security, and smoke tests.
- **CD**: Handles the multi-target build and push to GHCR.
- **Gating**: CD must be strictly gated by CI success.

## Troubleshooting

- **Image Not Found**: If the smoke test fails with a "container not found" error, ensure you have provided the correct `build-verify-cmd` in `ci.yml`.
- **Runner Issues**: All workflows are configured for `runs-on: self-hosted`. Ensure your runner is active and has the required toolchains installed.
