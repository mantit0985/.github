# .github - Control Plane

![Heartbeat](https://github.com/mantit0985/.github/actions/workflows/runner-heartbeat.yml/badge.svg)
![Validator](https://github.com/mantit0985/.github/actions/workflows/pr-validator.yml/badge.svg)
![License](https://img.shields.io/github/license/mantit0985/.github)

This repository serves as the centralized governance and orchestration hub for the `mantit0985` template estate. It defines the "Gold Standard" for CI/CD, security scanning, and deployment across all template repositories.

### Governance & Standards
- **Centralization**: All CI/CD logic is delegated to the hub to eliminate duplication and maintenance toil.
- **Symmetry**: Enforces the "One CI + One CD" contract across the entire template repositories.
- **Execution**: Optimized for `self-hosted` runners to leverage local hardware and avoid credit consumption.

##  Infrastructure Components

### 1. Reusable Workflows (`.github/workflows/`)

#### `ci.yml`
The standardized Continuous Integration pipeline.
- **Pipeline**: `quality` $\rightarrow$ `build-verify` (optional) $\rightarrow$ `security` $\rightarrow$ `smoke`.
- **Inputs**:
    - `language` (Required): `rust`, `python`, `go`, `cpp`, `nodejs`, `zig`.
    - `smoke-image` (Required): The container image for validation.
    - `build-verify-cmd` (Optional): Custom command to build the target image.

#### `cd.yml`
The standardized Continuous Deployment pipeline.
- **Pipeline**: `ci-gate` (optional) $\rightarrow$ `release` (optional) $\rightarrow$ `deploy`.
- **Inputs**:
    - `image_name` (Required): Base name of the image to deploy.
    - `tag` (Optional): Specific git ref or tag.
    - `enable_ci_gate` (Optional): API-based polling to block CD until CI success.
NOTE: callers enabling `enable_ci_gate` must declare `actions: read` (with `contents: read`) in their wrapper workflow's permissions, because the ci-gate job queries the Actions API.
    - `release_cmd` (Optional): Command for specialized binary releases.
    - `release_artifact_path` (Optional): Path to the binary for artifact upload.

### 2. Composite Actions (`.github/actions/`)

| Action | Purpose | Key Feature |
| :--- | :--- | :--- |
| `security-scan` | SAST & SCA | Integrates Semgrep (SAST) and Trivy (SCA) for both source and images. |
| `container-deploy` | Multi-Target Push | Standardized build/push of `slim`, `alpine`, and `distroless` variants to GHCR. |
| `smoke-test` | Health Probes | Automated `curl` probes for `/healthz`, `/readyz`, `/metrics`, and `/version`. |
| `pr-labeler` | PR Labeling | Automates PR categorization based on branch prefixes and file patterns. |

##  The Symmetry Contract
To maintain operational stability, all template repositories must adhere to the **Symmetry Contract**:
- **Exactly one CI run** per trigger.
- **Exactly one CD run** per trigger.
- **Strict Gating**: CD must never execute unless the corresponding CI run has concluded with `success`.

##  Operational Model

### Pull-Based Synchronization
Templates use a scheduled workflow to pull updates from this hub (e.g., PR templates, labeling configs) using their own `GITHUB_TOKEN`.

### Hub Internal Governance
- `pr-validator.yml`: Enforces Conventional Commits, PR template completion, and the "No Emojis" rule.
- `runner-heartbeat.yml`: Monitors the connectivity and health of the self-hosted runners on `edge-gpu-02`.
