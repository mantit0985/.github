# 🛠️ Maintenance Guide: .github Hub

This repository serves as the central configuration hub for the `mantit0985` GitHub account.

## 🔐 Required Secrets
To enable full automation, the following secrets must be added to this repository:

| Secret | Scope | Purpose |
| :--- | :--- | :--- |
| `GH_PAT` | `repo`, `user` | Used by Health Auditor and Profile Tracker to access API data. |
| `PROJECT_TOKEN` | `project` | Required for the Master Roadmap automation to manage project boards. |

## 🚀 Workflow Management
### 1. Profile Activity Tracker
Updates `profile/README.md` with recent push events.
- **Trigger**: Daily cron or `workflow_dispatch`.

### 2. Account Health Auditor
Generates `HEALTH_REPORT.md` scanning all public repos.
- **Trigger**: Daily cron or `workflow_dispatch`.

### 3. Markdown Linter
Ensures all `.md` files in the account follow industry standards.
- **Trigger**: On every push to `.md` files.

## 🛰️ Adding a New Satellite Repo
To link a new repository to this central hub:
1. Create the repo.
2. Add `.github/workflows/lint.yml` with the following content:
   ```yaml
   jobs:
     lint:
       uses: mantit0985/.github/.github/workflows/lint-markdown.yml@master
   ```

## 🔍 Troubleshooting
- **`GH007` Error**: This occurs when pushing a private email. Ensure your Git config uses the noreply email: `282219401+mantit0985@users.noreply.github.com`.
- **`Lint Markdown` Failure**: Run `markdownlint` locally or check the GitHub Action logs to identify the specific line causing the failure.
