# GitHub Secrets Management Strategy

## Objective
Implement a scalable, secure, and maintainable secrets management layer for the `mantit0985` GitHub ecosystem to minimize duplication and prevent accidental exposure.

## Proposed Hierarchy

### 1. Organization-Level Secrets (Global)
**Use Case**: Secrets shared across multiple repositories (e.g., automation bots, central API keys).
- **Examples**: `GH_PAT` (Global Personal Access Token), `ORG_WIDE_TOKEN`.
- **Configuration**: Defined at the Org level $\rightarrow$ Scoped to "Selected Repositories".
- **Benefit**: Update once, propagate to all dependent workflows.

### 2. Repository-Level Secrets (Local)
**Use Case**: Secrets specific to a single repository's logic.
- **Examples**: `HUB_INTERNAL_KEY`, `SPECIFIC_REPO_TOKEN`.
- **Configuration**: Defined in `Settings` $\rightarrow$ `Secrets and variables` $\rightarrow$ `Actions`.
- **Benefit**: Strict isolation; limits blast radius if a repo is compromised.

### 3. Environment-Level Secrets (Contextual)
**Use Case**: Secrets that vary by deployment target (Development $\rightarrow$ Staging $\rightarrow$ Production).
- **Examples**: `DATABASE_URL_PROD`, `AWS_SECRET_ACCESS_KEY_STAGING`.
- **Configuration**: Defined under `Environments` $\rightarrow$ `Environment Secrets`.
- **Benefit**: Allows using the same workflow file across different environments while injecting different keys.

## Implementation Roadmap

| Secret | Recommended Level | Reason |
| :--- | :--- | :--- |
| `GH_PAT` | **Organization** | Used by the hub and satellite repos for API calls. |
| `PROJECT_TOKEN` | **Organization** | Required for Master Roadmap across multiple project boards. |
| `DEPLOY_KEY` | **Environment** | Ensures production keys are only accessible via the `production` environment. |

## Security Guardrails
- **Least Privilege**: Grant the `GH_PAT` only the minimum scopes required (e.g., `repo`, `user`).
- **Rotation**: Rotate all high-level tokens every 90 days.
- **No Hardcoding**: Use `.gitignore` and pre-commit hooks (e.g., `detect-secrets`) to prevent secrets from entering the codebase.
