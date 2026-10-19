# GitHub Secrets Management Strategy

This document defines how secrets are managed across the `mantit0985` GitHub ecosystem. The goal is to minimize duplication, reduce the risk of accidental exposure, and keep repository defaults reproducible.

## Hierarchy

### 1. Organization-level secrets (shared)

Use for tokens and keys that multiple repositories need.

- `GH_PAT` — automation token for cross-repo workflows, issue/PR operations, and project board updates.
- `ORG_WIDE_TOKEN` — reserved for future org-wide integrations.

Configure these at the organization or account level and scope them only to repositories that need them.

### 2. Repository-level secrets (local)

Use for secrets that belong to a single repository.

- Deployment keys.
- Service-specific API tokens.
- Repository-local signing keys.

### 3. Environment-level secrets (contextual)

Use for secrets that differ by deployment target.

- `DATABASE_URL_PROD`, `DATABASE_URL_STAGING`.
- Cloud provider credentials per environment.

## Recommended placement

| Secret | Level | Reason |
| --- | --- | --- |
| `GH_PAT` | Organization | Shared by hub workflows and satellite repos for API calls. |
| `PROJECT_TOKEN` | Organization | Used by project board automation that spans repositories. |
| `DEPLOY_KEY` | Environment | Production keys should only be available in the `production` environment. |

## Guardrails

- **Least privilege**: grant tokens only the scopes they need.
- **Rotation**: rotate high-privilege tokens at least every 90 days.
- **No hardcoding**: never commit secrets; load them through `secrets` context in workflows.
- **No logs**: mask secrets in workflow logs and avoid printing them.
